const { logger, formatJson } = require(`../utils/logger`);
const { AjaxResponse } = require(`../classes/ajax-response`);

const accountRedis = require("../services/redis/account-service");
const chatRedis = require(`../services/redis/chatroom-service`);
const userRedis = require(`../services/redis/user-service`);
const { checkOwnership, getOwner } = require(`../services/mongodb/character-service`);

/* Signals definitions. Listed here since some IDEs will mark unused variables. */
const ROOM_MSG_SIG = "room message posted";
const ROOM_ADDED_SIG = "room added";
// const ROOM_REMOVED_SIG = "room removed";
const ROOM_UPDATE_SIG = "room updated";

const USER_JOINED_SIG = "user joined";
const USER_LEFT_SIG = "user left";
const USER_KICKED_SIG = "user kicked";
const USER_BANNED_SIG = "user banned";
const USER_UNBANNED_SIG = "user unbanned";

const KICKED_SIG = "kicked";
const BANNED_SIG = "banned";

/** Utility functions ********************************************************/
/**
 * Utility function to check the following (this is done for most handlers):
 * - Make sure the room name and character were passed through
 * - Make sure the user ID of the socket owns the character
 * - Make sure the room exists
 * @param {*} socket
 * @param {*} data
 * @returns
 */
async function verifyInputs(socket, inputdata) {
	let response = new AjaxResponse();

	if (!("characterName" in inputdata && "roomName" in inputdata)) {
		response.msg = "Missing parameters";
	}

	const { characterName } = inputdata;
	const userId = socket.request.session.userID;
	const ownsCharacter = await verifyOwner(characterName, userId);
	if (!ownsCharacter) {
		response.msg = `User does not own ${characterName}`;
	} else {
		response.success = true;
	}
	return response;
}

/** This function caches character ownership from MongoDB to Redis */
async function verifyOwner(characterName, userID) {
	let ownsCharacter = await accountRedis.verifyOwner(characterName);

	if (!ownsCharacter) {
		ownsCharacter = await checkOwnership(characterName, userID);
		if (ownsCharacter) {
			accountRedis.addOwner(characterName, userID);
		}
	}
	logger.debug(`${userID} owns ${characterName}? ${ownsCharacter}`);
	return ownsCharacter;
}

/** Socket IO handlers *******************************************************/
/**
 * Creates a chat room in the socket.
 * @param {*} socket
 * @param {*} data - Data used to create the room. Requires a characterName and
 *                   roomName. Other parameters are optional.
 * @returns
 */
async function handleCreateRoom(socket, data) {
	let response = new AjaxResponse();
	if (!("characterName" in data && "roomName" in data)) {
		response.msg = "Missing parameters";
		return response;
	}

	const { characterName, roomName } = data;
	const { userID } = socket.request.session;

	if (await chatRedis.checkRoomExists(roomName)) {
		response.msg = `Room already exists`;
	} else if (!(await verifyOwner(characterName, userID))) {
		response.msg = `Error with creating room`;
	} else {
		response.success = true;
		await chatRedis.createRoom(data);
		await chatRedis.addInRoom(roomName, characterName);
		await accountRedis.incrementInRoom(userID, roomName);
		socket.join(roomName);
		socket.broadcast.emit(ROOM_ADDED_SIG, { roomName: roomName });
	}
	return response;
}

async function handleJoinRoom(socket, data) {
	logger.debug(`handleJoinRoom: ${formatJson(data)}`);
	const response = await verifyInputs(socket, data);

	if (!response.success) {
		return response;
	}
	const { characterName, roomName } = data;
	const { userID } = socket.request.session;

	if (await chatRedis.isBanned(roomName, characterName)) {
		response.success = false;
		response.msg = `You are banned from ${roomName}`;
		return response;
	} else if ((await chatRedis.addInRoom(roomName, characterName)) == 0) {
		response.success = false;
		response.msg = `Character is already in room`;
		return response;
	}

	response.data = await chatRedis.getData(roomName);
	await accountRedis.incrementInRoom(userID, roomName);
	socket.join(roomName);
	socket.to(roomName).emit(USER_JOINED_SIG, data);
	return response;
}

async function handleLeaveRoom(socket, data) {
	logger.debug(`handleLeaveRoom: ${formatJson(data)}`);
	const response = await verifyInputs(socket, data);

	if (!response.success) {
		return response;
	}
	const { characterName, roomName } = data;
	if ((await chatRedis.removeInRoom(roomName, characterName)) == 1) {
		socket.leave(roomName);

		let userList = await chatRedis.getInRoom(roomName);
		if (userList.length == 0) {
			// TODO: Reinstate this logic at some point
			// chatRedis.removeRoom(roomName);
			// socket.broadcast(ROOM_REMOVED_SIG, { roomName: roomName });
		} else {
			socket.to(roomName).emit(USER_LEFT_SIG, data);
		}
		return response;
	} else {
		response.success = false;
		response.msg = "Error leaving room, try again.";
		return response;
	}
}

async function handlePostMessage(socket, data) {
	logger.debug(`handlePostMessage: ${formatJson(data)}`);
	let response = await verifyInputs(socket, data);

	if (!response.success) {
		return response;
	}

	const { characterName, roomName } = data;
	if (await chatRedis.checkInRoom(roomName, characterName)) {
		socket.to(roomName).emit(ROOM_MSG_SIG, data);
		response.data = data;
	} else {
		response.success = false;
	}
	return response;
}

async function handleGetRoomInfo(data) {
	logger.debug(`handleGetRoomInfo: ${formatJson(data)}`);
	let response = new AjaxResponse();
	if (!response.success) {
		return response;
	}

	const { characterName, roomName } = data;
	const isMod = await chatRedis.isMod(roomName, characterName);
	const roomData = await chatRedis.getData(roomName, isMod);
	response.success = Object.keys(roomData).length !== 0;
	response.data = roomData;
	return response;
}

async function handleModAction(server, socket, data) {
	logger.debug(`handleModAction: ${formatJson(data)}`);
	const response = await verifyInputs(socket, data);

	if (!response.success) {
		return response;
	} else if (!("reasonMsg" in data && "targetName" in data)) {
		response.message = "Not enough parameters";
		return response;
	}
	const { characterName, roomName, targetName, action } = data;

	// A bunch of things to verify the pecking order
	const isOwner = await chatRedis.isOwner(roomName, characterName);
	const isMod = await chatRedis.isMod(roomName, characterName);
	const targetIsMod = await chatRedis.isMod(roomName, targetName);

	logger.debug(`isOwner: ${isOwner} | isMod: ${isMod} | targetIsMod: ${targetIsMod}`);

	if (!isOwner) {
		return response;
	} else if (isMod && targetIsMod) {
		return response;
	}

	delete data[`action`];
	response.success = true;

	logger.debug(`Performing mod action: ${formatJson(data)}`);
	if (action == `kick` || action == `ban`) {
		const emitSig = action == `kick` ? USER_KICKED_SIG : USER_BANNED_SIG;
		const ackSig = action == `kick` ? KICKED_SIG : BANNED_SIG;
		const targetUserId = await getOwner(targetName);
		const socketTarget = await userRedis.getUserConnection(targetUserId);
		const removeResult = await chatRedis.removeInRoom(roomName, targetName);

		// TODO: Resolve the issue of making sure the person booted stops receiving messages
		if (removeResult > 0) {
			logger.debug(`Kicking ${targetName} (${socketTarget}) from ${roomName}`);
			socket.to(roomName).emit(emitSig, data);
			server.to(socketTarget).emit(ackSig, data.reasonMsg);
		}
	} else if (action == `unban`) {
		await chatRedis.removeBanned(roomName, targetName);
		socket.to(roomName).emit(USER_UNBANNED_SIG, data);
	} else if (isOwner == true) {
		if (action == `mod`) {
			await chatRedis.addMod(roomName, targetName);
		} else if (action == `unmod`) {
			await chatRedis.removeMod(roomName, targetName);
		} else if (action == `new owner`) {
			await chatRedis.addMod(roomName, targetName);
			await chatRedis.switchOwner(roomName, targetName);
		}
	} else {
		response.msg = `UnHandled action ${action}`;
		response.success = false;
	}
	return response;
}

async function handleSetRoomSettings(socket, data) {
	logger.debug(`handleSetRoomSettings: ${formatJson(data)}`);
	let response = await verifyInputs(socket, data);
	if (!response.success) {
		return response;
	}

	const { characterName, roomName } = data;
	const isMod = await chatRedis.isMod(roomName, characterName);
	if (isMod == false) {
		return response;
	}

	if (`description` in data) {
		chatRedis.updateOptions(roomName, data.description);
	}
	if (`isPrivate` in data) {
		chatRedis.setPrivate(roomName, data.isPrivate);
	}
	response.success = true;
	return response;
}

async function broadcastRoomUpdate(socket, data) {
	const { roomName } = data;
	const roomData = await chatRedis.getData(roomName, false);
	let updateAnnouncement = new AjaxResponse();
	updateAnnouncement.success = true;
	updateAnnouncement.data = roomData;
	socket.to(roomName).emit(ROOM_UPDATE_SIG, updateAnnouncement);
}

async function connectHandlers(server, socket) {
	socket.on(`get rooms`, async (data, ack) => {
		let roomList = await chatRedis.getPublicRoomNames();
		ack(roomList);
	});

	socket.on(`create room`, async (data, ack) => {
		let response = await handleCreateRoom(socket, data);
		ack(response);
	});

	socket.on(`join room`, async (data, ack) => {
		let response = await handleJoinRoom(socket, data);
		ack(response);
	});

	socket.on(`leave room`, async (data, ack) => {
		let response = await handleLeaveRoom(socket, data);
		ack(response);
	});

	socket.on(`post message`, async (data, ack) => {
		ack(await handlePostMessage(socket, data));
	});

	socket.on(`get room info`, async (data, ack) => {
		ack(await handleGetRoomInfo(data));
	});

	socket.on(`mod action`, async (data, ack) => {
		let response = await handleModAction(server, socket, data);
		ack(response);
	});

	socket.on(`set room settings`, async (data, ack) => {
		let response = await handleSetRoomSettings(socket, data);
		if (response.success) {
			broadcastRoomUpdate(socket, data);
		}
		ack(response);
	});

	socket.emit(`room list`, await chatRedis.getPublicRoomNames());
}

async function removeInRooms(socket) {
	const { userID } = socket.request.session;
	const characterList = await accountRedis.getCharacters(userID);
	const rooms = await accountRedis.getInRooms(userID);
	logger.debug(`Removing in rooms for ${userID}`);

	rooms.forEach((roomName) => {
		characterList.forEach(async (characterName) => {
			let result = await chatRedis.removeInRoom(roomName, characterName);
			if (result == 0) {
				return;
			}
			socket.to(roomName).emit(USER_LEFT_SIG, {
				characterName: characterName,
				roomName: roomName,
			});
		});
	});
	accountRedis.clearInRooms(userID);
}

module.exports = {
	connectHandlers,
	removeInRooms,
};
