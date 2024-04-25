const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);

const chatService = require(`../services/redis/chatroom-service`);
const characterService = require(`../services/redis/character-service`);

/**
 * Utility function to check the following (this is done for most handlers):
 * - Make sure the room name and character were passed through
 * - Make sure the user ID of the socket owns the character
 * - Make sure the room exists
 * @param {*} socket
 * @param {*} data
 * @returns
 */
async function verifyParameters(socket, data) {
	const userId = socket.request.session.userId;
	const roomName = data[`roomName`];
	const characterName = data[`characterName`];
	let status = new SocketIoResponse();

	if (roomName == undefined || characterName == undefined) {
		return status;
	} else if ((await characterService.verifyUserOwnsCharacter(userId, characterName)) == false) {
		status.msg = `User does not own ${characterName}`;
		return status;
	} else if ((await chatService.checkRoomExists(roomName)) == false) {
		status.msg = `Room ${roomName} is not available.`;
		return status;
	} else {
		status.success = true;
		return status;
	}
}

/**
 * Since a lot of handlers have the same guard condition checks, this function performs those checks before
 * calling the actual handler.
 * @param {*} socket
 * @param {*} data
 * @param {*} handlerFunc
 * @returns
 */
async function mainHandler(socket, data, ack, handler) {
	try {
		let status = await verifyParameters(socket, data);
		if (status.success === true && typeof handler === `function`) {
			status = handler(socket, data);
			status.data = data;
		} else {
			status.success = false;
		}
		ack(status);
	} catch (error) {
		logger.info(`Event '${socket.event}' error: ${error}`);
		ack(new SocketIoResponse());
	}
}

/**
 * Sends the room list to users when they connect to the socket IO server
 * @param {*} socket
 */
async function sendRoomList(socket) {
	const roomList = await chatService.getPublicRoomNames();
	socket.emit(`room list`, roomList);
}

/**
 * Creates a chat room in the socket.
 * @param {*} socket
 * @param {*} data - Data used to create the room. Requires a characterName and roomName. Other parameters are optional.
 * @returns
 */
async function handleCreateRoom(socket, data) {
	console.log(data, socket.event);
	logger.debug(`Handling create room ${formatJson(data)}`);

	const userId = socket.request.session.userId;
	const roomName = data[`roomName`];
	const characterName = data[`characterName`];
	let status = new SocketIoResponse();

	if ((await chatService.checkRoomExists(roomName)) == 1) {
		status.msg = `Room already exists`;
	} else if ((await characterService.verifyUserOwnsCharacter(userId, characterName)) == 0) {
		status.msg = `User does not own ${data.characterName}`;
	} else {
		status.success = true;
		await chatService.createRoom(data);
		await chatService.addMod(roomName, characterName);
		await chatService.addInRoom(roomName, characterName);
		socket.join(roomName);
		socket.to(roomName).emit(`room user joined`, { characterName: characterName });
	}
	return status;
}

async function handleJoinRoom(socket, data) {
	logger.debug(`handling join room`);

	const roomName = data[`roomName`];
	const characterName = data[`characterName`];

	let status = new SocketIoResponse();
	if ((await chatService.checkIfBanned(roomName, characterName)) == 1) {
		status.msg = `You are banned from ${roomName}`;
		return status;
	}

	let joinResult = await chatService.addInRoom(roomName, characterName);
	if (joinResult == 0) {
		status.success = false;
		status.msg = `Character is already in room`;
		return status;
	} else {
		status.success = true;
		socket.join(roomName);
		socket.to(roomName).emit(`room user joined`, { characterName: characterName });
		return status;
	}
}

async function handleLeaveRoom(socket, data) {
	logger.debug(`handling leave room`);

	const roomName = data[`roomName`];
	const characterName = data[`characterName`];
	let status = new SocketIoResponse();

	let leaveResult = await chatService.removeInRoom(roomName, characterName);
	if (leaveResult == 1) {
		status.success = true;
		socket.leave(roomName);
		socket.to(roomName).emit(`room user left`, { characterName: characterName });
	}
	return status;
}

async function handlePostMessage(socket, data) {
	logger.debug(`handling post message`);

	const roomName = data[`roomName`];
	const characterName = data[`characterName`];
	let status = new SocketIoResponse();

	if ((await chatService.checkInRoom(roomName, characterName)) == 1) {
		status.msgid = `${Date.now()}-${data[`characterId`]}`;
		status.success = true;
		socket.to(roomName).emit(`room message posted`, data);
	}
	return status;
}

async function handleGetRoomInfo(data) {
	logger.debug(`hanlding get room info ${formatJson(data)}`);
	const roomName = data[`roomName`];
	let status = new SocketIoResponse();
	let roomData = {};

	roomData = await chatService.getRoomData(roomName, false);
	if (data.modRequest == true) {
		const characterName = data[`characterName`];
		const isMod = await chatService.isMod(roomName, characterName);
		if (isMod) {
			roomData = await chatService.getRoomData(roomName, true);
		}
	}
	status.success = true;
	status.roomData = roomData;

	return status;
}

async function handleModAction(socket, data) {
	logger.debug(`handling mod action`);

	const roomName = data[`roomName`];
	const characterName = data[`characterName`];
	const targetName = data[`targetName`];
	const userId = socket.request.session.userId;
	let status = new SocketIoResponse();

	const isOwner = await chatService.isOwner(roomName, userId);
	const isMod = await chatService.isMod(roomName, characterName);
	const targetIsMod = await chatService.isMod(roomName, targetName);

	if (isMod == false) {
		return status;
	} else if (targetIsMod == true && isOwner == false) {
		return status;
	}

	const action = data[`action`];
	let modActionData = {
		roomName: roomName,
		characterName: targetName,
		reason: data[`msg`],
	};
	status.success = true;

	if (action == `kick`) {
		let removeResult = await chatService.removeInRoom(roomName, targetName);
		if (removeResult > 0) {
			socket.to(roomName).emit(`room user kicked`, modActionData);
		}
	} else if (action == `add ban`) {
		await chatService.removeInRoom(roomName, targetName);
		await chatService.addBanned(roomName, targetName);
		socket.to(roomName).emit(`room user banned`, modActionData);
	} else if (action == `remove ban`) {
		await chatService.removeBanned(roomName, targetName);
		socket.to(roomName).emit(`room user unbanned`, modActionData);
	} else if (isOwner == true) {
		if (action == `add mod`) {
			await chatService.addMod(roomName, targetName);
		} else if (action == `remove mod`) {
			await chatService.removeMod(roomName, targetName);
		} else if (action == `switch owner`) {
			await chatService.addMod(roomName, targetName);
			await chatService.switchOwner(roomName, targetName);
		}
	} else {
		status.msg = `Unhandled action ${action}`;
		status.success = false;
	}
	return status;
}

async function handleSetRoomSettings(socket, data) {
	logger.debug(`handling set room settings ${formatJson(data)}`);

	const roomName = data[`roomName`];
	const characterName = data[`characterName`];
	const isMod = await chatService.isMod(roomName, characterName);
	let status = new SocketIoResponse();
	if (isMod == false) {
		return status;
	}

	if (`description` in data) {
		chatService.setDescription(roomName, data[`description`]);
	}
	if (`private` in data) {
		chatService.setPrivate(roomName, data[`private`]);
	}
	socket.to(roomName).emit(`room update`);
	status.success = true;
	return status;
}

async function setupSocket(io, socket) {
	sendRoomList(socket);

	socket.on(`get rooms`, () => {
		chatService.getPublicRoomNames().then((roomList) => socket.emit(`room list`, roomList));
		sendRoomList(socket);
	});

	socket.on(`create room`, (data, ack) =>
		handleCreateRoom(socket, data)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error creating a room ${err}`);
				ack(new SocketIoResponse());
			})
	);

	socket.on(`join room`, (data, ack) => mainHandler(socket, data, ack, handleJoinRoom));
	socket.on(`leave room`, (data, ack) => mainHandler(socket, data, ack, handleLeaveRoom));
	socket.on(`post message`, (data, ack) => mainHandler(socket, data, ack, handlePostMessage));
	socket.on(`get room info`, (data, ack) => mainHandler(socket, data, ack, handleGetRoomInfo));
	socket.on(`mod action`, (data, ack) => mainHandler(socket, data, ack, handleModAction));
	socket.on(`set room settings`, (data, ack) => mainHandler(socket, data, ack, handleSetRoomSettings));
}

module.exports = {
	setupSocket,
};
