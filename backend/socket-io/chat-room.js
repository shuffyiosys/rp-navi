const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);
const { getMD5 } = require(`../utils/crypto`);

const chatService = require(`../services/redis/chatroom-service`);
const userService = require("../services/redis/user-service");
const characterMongoDb = require(`../services/mongodb/character-service`);
const characterService = require(`../services/redis/character-service`);

/* Signals definitions. Listed here since some IDEs will mark unused variables. */
const ROOM_MSG_SIG = "room message posted";
const ROOM_ADDED_SIG = "room added";
const ROOM_REMOVED_SIG = "room removed";
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
async function verifyCommonParameters(socket, data) {
	let response = new SocketIoResponse();

	if (!("characterName" in data) || !("roomName" in data)) {
		response.msg = "Missing parameters";
	}

	const userId = socket.request.session.userID;
	const characterOwner = await characterService.getCharacterOwner(data.characterName);
	const roomExists = await chatService.checkRoomExists(data.roomName);
	if (characterOwner != userId) {
		response.msg = `User does not own ${data.characterName}`;
	} else if (!roomExists) {
		response.msg = `Room ${data.roomName} is not available.`;
	} else {
		response.success = true;
	}
	return response;
}

/** Socket IO handlers *******************************************************/
/**
 * Creates a chat room in the socket.
 * @param {*} socket
 * @param {*} data - Data used to create the room. Requires a characterName and roomName. Other parameters are optional.
 * @returns
 */
async function handleCreateRoom(socket, data) {
	logger.debug(`Handling create room ${formatJson(data)}`);
	let response = new SocketIoResponse();
	if (!("characterOwner" in data) || !("roomName" in data)) {
		response.msg = "Missing parameters";
	}
	const userId = socket.request.session.userID;
	const roomExists = await chatService.checkRoomExists(data.roomName);
	const characterOwner = await characterService.getCharacterOwner(data.characterName);

	if (roomExists == 1) {
		response.msg = `Room already exists`;
	} else if (characterOwner != userId) {
		response.msg = `User does not own ${data.data.characterName}`;
	} else {
		response.success = true;
		await chatService.createRoom(data);
		await chatService.addMod(data.roomName, data.characterName);
		await chatService.addInRoom(data.roomName, data.characterName);
		socket.join(data.roomName);

		let newRoomAnnouncement = new SocketIoResponse();
		newRoomAnnouncement.success = true;
		newRoomAnnouncement.data = {
			roomName: data.roomName,
		};
		socket.emit(ROOM_ADDED_SIG, newRoomAnnouncement);
	}
	return response;
}

async function handleJoinRoom(socket, data) {
	logger.debug(`handleJoinRoom: ${formatJson(data)}`);
	let response = await verifyCommonParameters(socket, data);

	if (!response.success) {
		return response;
	}

	const isBanned = await chatService.checkIfBanned(data.roomName, data.characterName);
	if (isBanned == 1) {
		response.msg = `You are banned from ${data.roomName}`;
		return response;
	}

	let joinResult = await chatService.addInRoom(data.roomName, data.characterName);
	if (joinResult == 0) {
		response.msg = `Character is already in room`;
	} else {
		response.success = true;
		characterService.addCharacterInRoom(data.characterName, data.roomName);
		socket.join(data.roomName);
		socket.to(data.roomName).emit(USER_JOINED_SIG, { characterName: data.characterName });
	}
	return response;
}

async function handleLeaveRoom(server, socket, data) {
	logger.debug(`handleLeaveRoom: ${formatJson(data)}`);
	let response = await verifyCommonParameters(socket, data);

	if (!response.success) {
		return response;
	}

	let leaveResult = await chatService.removeInRoom(data.roomName, data.characterName);
	if (leaveResult == 0) {
		response.message = "Character is not in room";
		return response;
	}

	response.success = true;
	await characterService.removeRoomWithCharacter(data.characterName, data.roomName);
	socket.leave(data.roomName);

	let userList = await chatService.getUsersInRoom(data.roomName);
	if (userList.length == 0) {
		chatService.removeRoom(data.roomName);
		server.emit(ROOM_REMOVED_SIG, { roomName: data.roomName });
	} else {
		socket.to(data.roomName).emit(USER_LEFT_SIG, { characterName: data.characterName });
	}
	return response;
}

async function handlePostMessage(socket, data) {
	logger.debug(`handlePostMessage: ${formatJson(data)}`);
	let response = await verifyCommonParameters(socket, data);

	if (!response.success) {
		return response;
	}

	let userInRoom = await chatService.checkInRoom(data.roomName, data.characterName);
	if (userInRoom == 1) {
		let hash = getMD5(data.characterName);
		response.msgid = `${Date.now()}-${hash}`;
		response.success = true;
		socket.to(data.roomName).emit(ROOM_MSG_SIG, data);
	}
	return response;
}

async function handleGetRoomInfo(socket, data) {
	logger.debug(`handleGetRoomInfo: ${formatJson(data)}`);
	let response = new SocketIoResponse();

	if (!("roomName" in data)) {
		response.msg = "Missing room name";
		return response;
	}

	let isMod = false;
	if ("characterName" in data) {
		const characterOwner = await characterService.getCharacterOwner(data.characterName);
		const userId = socket.request.session.userID;

		if (characterOwner == userId) {
			isMod = await chatService.isMod(data.roomName, data.characterName);
		}
	}

	const roomData = await chatService.getRoomData(data.roomName, isMod);
	response.success = Object.keys(roomData).length !== 0;
	response.data = roomData;

	return response;
}

async function handleModAction(server, socket, data) {
	logger.debug(`handleModAction: ${formatJson(data)}`);
	let response = await verifyCommonParameters(socket, data);

	if (!response.success) {
		return response;
	} else if (!("reasonMsg" in data) || !("targetName" in data)) {
		response.message = "Not enough parameters";
		return response;
	}

	const isOwner = await chatService.isOwner(data.roomName, data.characterName);
	const isMod = await chatService.isMod(data.roomName, data.characterName);
	const targetIsMod = await chatService.isMod(data.roomName, data.targetName);

	logger.debug(`isOwner: ${isOwner} | isMod: ${isMod} | targetIsMod: ${targetIsMod}`);

	if (isMod == false) {
		return response;
	} else if (targetIsMod == true && isOwner == false) {
		return response;
	}

	const action = data[`action`];
	let modActionData = {
		roomName: data.roomName,
		targetName: data.targetName,
		reason: data.reasonMsg,
	};
	response.success = true;

	logger.debug(`Performing mod action: ${formatJson(modActionData)}`);
	if (action == `kick`) {
		const targetUserId = await characterService.getCharacterOwner(data.targetName);
		const socketTarget = await userService.getUserConnection(targetUserId);
		const removeResult = await chatService.removeInRoom(data.roomName, data.targetName);
		if (removeResult > 0) {
			logger.debug(`Kicking ${data.targetName} (${socketTarget}) from ${data.roomName}`);
			socket.to(data.roomName).emit(USER_KICKED_SIG, modActionData);
			server.to(socketTarget).emit(KICKED_SIG, data.reasonMsg);
		}
	} else if (action == `ban`) {
		await chatService.removeInRoom(data.roomName, data.targetName);
		await chatService.addBanned(data.roomName, data.targetName);

		const targetUserId = await characterService.getCharacterOwner(data.targetName);
		const socketTarget = await userService.getUserConnection(targetUserId);
		socket.to(data.roomName).emit(USER_BANNED_SIG, modActionData);
		server.to(socketTarget).emit(BANNED_SIG, data.reasonMsg);
	} else if (action == `unban`) {
		await chatService.removeBanned(data.roomName, data.targetName);
		socket.to(data.roomName).emit(USER_UNBANNED_SIG, modActionData);
	} else if (isOwner == true) {
		if (action == `mod`) {
			await chatService.addMod(data.roomName, data.targetName);
		} else if (action == `unmod`) {
			await chatService.removeMod(data.roomName, data.targetName);
		} else if (action == `new owner`) {
			await chatService.addMod(data.roomName, data.targetName);
			await chatService.switchOwner(data.roomName, data.targetName);
		}
	} else {
		response.msg = `Unhandled action ${action}`;
		response.success = false;
	}
	return response;
}

async function handleSetRoomSettings(socket, data) {
	logger.debug(`handleSetRoomSettings: ${formatJson(data)}`);
	let response = await verifyCommonParameters(socket, data);
	if (!response.success) {
		return response;
	}

	const isMod = await chatService.isMod(data.roomName, data.characterName);
	if (isMod == false) {
		return response;
	}

	if (`description` in data) {
		chatService.setDescription(data.roomName, data.description);
	}
	if (`isPrivate` in data) {
		chatService.setPrivate(data.roomName, data.isPrivate);
	}
	response.success = true;
	return response;
}

async function broadcastRoomUpdate(socket, data) {
	const roomData = await chatService.getRoomData(data.roomName, false);
	let updateAnnouncement = new SocketIoResponse();
	updateAnnouncement.success = true;
	updateAnnouncement.data = roomData;
	socket.to(data.roomName).emit(ROOM_UPDATE_SIG, updateAnnouncement);
}

async function connectHandlers(server, socket) {
	socket.on(`get rooms`, async (data, ack) => {
		let roomList = await chatService.getPublicRoomNames();
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
		let response = await handleLeaveRoom(server, socket, data);
		ack(response);
	});

	socket.on(`post message`, async (data, ack) => {
		let response = await handlePostMessage(socket, data);
		ack(response);
	});

	socket.on(`get room info`, async (data, ack) => {
		let response = await handleGetRoomInfo(socket, data);
		ack(response);
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
}

async function removeInRooms(server, socket) {
	const userId = socket.request.session.userID;
	const characterList = await characterMongoDb.getCharacterList(userId);
	logger.debug(`Removing in rooms for ${userId}`);

	characterList.forEach(async (characterName) => {
		let charactersInRooms = await characterService.getRoomsWithCharacter(characterName);
		charactersInRooms.forEach((roomName) => {
			logger.debug(`Removing ${characterName} from ${roomName}`);
			let data = {
				characterName: characterName,
				roomName: roomName,
			};
			handleLeaveRoom(server, socket, data);
		});
	});
}

module.exports = {
	connectHandlers,
	removeInRooms,
};
