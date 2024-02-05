const { logger, formatJson } = require("../utils/logger");
const { SocketIoResponse } = require("../classes/socket-io-response");

const chatService = require("../services/redis/chatroom-service");
const characterService = require("../services/redis/character-service");

async function setupSocket(io, socket) {
	sendRoomList(socket);

	socket.on("get rooms", (data, ack) => {
		const status = new SocketIoResponse();
		status.success = true;
		ack(status);
		chatService.getPublicRoomNames().then((roomList) => socket.emit("room list", roomList));
		sendRoomList(socket);
	});

	socket.on("create room", (data, ack) =>
		handle_createRoom(socket, data)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error creating a room ${err}`);
				ack({ success: false, msg: "" });
			})
	);

	socket.on("join room", (data, ack) =>
		mainHandler(socket, data, handle_joinRoom)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error joining a room: ${err}`);
				ack({ success: false, msg: "" });
			})
	);

	socket.on("leave room", (data, ack) =>
		handle_leaveRoom(socket, data)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error leaving a room: ${err}`);
				ack({ success: false, msg: "" });
			})
	);

	socket.on("post message", (data, ack) =>
		mainHandler(socket, data, handle_postMessage)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error joining a room: ${err}`);
				ack({ success: false, msg: "" });
			})
	);

	socket.on("get room info", (data, ack) => {
		handle_getRoomInfo(data)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error get room info: ${err}`);
				ack({ success: false, msg: "" });
			});
	});

	socket.on("mod action", (data, ack) =>
		mainHandler(socket, data, handle_modAction)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error handling mod action: ${err}`);
				ack({ success: false, msg: "" });
			})
	);

	socket.on("set room settings", (data, ack) =>
		mainHandler(socket, data, handle_setRoomSettings)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error updating room settings: ${err}`);
				ack({ success: false, msg: "" });
			})
	);
}

async function sendRoomList(socket) {
	const roomList = await chatService.getPublicRoomNames();
	socket.emit("room list", roomList);
}

async function verifyParameters(socket, data) {
	const userId = socket.request.session.userId;
	const roomName = data["roomName"];
	const characterName = data["characterName"];
	let status = { success: false, msg: "" };

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
async function mainHandler(socket, data, handlerFunc) {
	let status = await verifyParameters(socket, data);
	if (status.success === true && typeof handlerFunc === "function") {
		status = handlerFunc(socket, data);
	} else {
		status.success = false;
	}
	return status;
}

async function handle_createRoom(socket, data) {
	logger.debug(`Handling create room ${formatJson(data)}`);

	const userId = socket.request.session.userId;
	const roomName = data["roomName"];
	const characterName = data["characterName"];
	let status = { success: false, msg: "" };

	if (roomName == undefined || characterName == undefined) {
		return status;
	} else if ((await chatService.checkRoomExists(roomName)) == 1) {
		status.msg = "Room already exists";
	} else if ((await characterService.verifyUserOwnsCharacter(userId, characterName)) == 0) {
		status.msg = `User does not own ${data.characterName}`;
	} else {
		status.success = true;
		const characterName = data.characterName;
		const roomName = data.roomName;
		const description = data["description"] == undefined ? "" : data.description;
		const privateRoom = data["privateRoom"] == undefined ? false : data.privateRoom;
		const password = data["password"] == undefined ? "" : data.password;

		await chatService.createRoom(roomName, userId, description, privateRoom, password);
		await chatService.addMod(roomName, characterName);
		await chatService.addInRoom(roomName, characterName);
		socket.join(roomName);
		socket.to(roomName).emit("room user joined", { characterName: characterName });
	}
	return status;
}

async function handle_joinRoom(socket, data) {
	logger.debug("handling join room");

	const roomName = data["roomName"];
	const characterName = data["characterName"];
	const password = data["password"] == undefined ? "" : data.password;

	let status = { success: false, msg: "" };
	if ((await chatService.checkIfBanned(roomName, characterName)) == 1) {
		status.msg = `You are banned from ${roomName}`;
		return status;
	} else if (
		(await chatService.isPasswordNeeded(roomName)) == true &&
		(await chatService.verifyRoomPassword(roomName, password)) == false
	) {
		status.msg = `Incorrect password `;
		return status;
	}

	let joinResult = await chatService.addInRoom(roomName, characterName);
	if (joinResult == 0) {
		status.success = false;
		status.msg = "Character is already in room";
		return status;
	} else {
		status.success = true;
		socket.join(roomName);
		socket.to(roomName).emit("room user joined", { characterName: characterName });
		return status;
	}
}

async function handle_leaveRoom(socket, data) {
	logger.debug("handling leave room");

	const roomName = data["roomName"];
	const characterName = data["characterName"];
	let status = { success: false, msg: "" };

	let leaveResult = await chatService.removeInRoom(roomName, characterName);
	if (leaveResult == 1) {
		status.success = true;
		socket.leave(roomName);
		socket.to(roomName).emit("room user left", { characterName: characterName });
	}
	return status;
}

async function handle_postMessage(socket, data) {
	logger.debug("handling post message");

	const roomName = data["roomName"];
	const characterName = data["characterName"];
	let status = { success: false, msg: "" };

	if ((await chatService.checkInRoom(roomName, characterName)) == 1) {
		status.success = true;
		socket.to(roomName).emit("room message posted", data);
	}
	return status;
}

async function handle_getRoomInfo(data) {
	logger.debug(`hanlding get room info ${formatJson(data)}`);
	const roomName = data["roomName"];
	let status = { success: false, msg: "" };
	let roomData = {};

	roomData = await chatService.getRoomData(roomName, false);
	if (data.modRequest == true) {
		const characterName = data["characterName"];
		const isMod = await chatService.isMod(roomName, characterName);
		if (isMod) {
			roomData = await chatService.getRoomData(roomName, true);
		}
	}
	status.success = true;
	status.roomData = roomData;

	return status;
}

async function handle_modAction(socket, data) {
	logger.debug("handling mod action");

	const roomName = data["roomName"];
	const characterName = data["characterName"];
	const targetName = data["targetName"];
	const userId = socket.request.session.userId;
	let status = { success: false, msg: "" };

	const isOwner = await chatService.isOwner(roomName, userId);
	const isMod = await chatService.isMod(roomName, characterName);
	const targetIsMod = await chatService.isMod(roomName, targetName);

	if (isMod == false) {
		return status;
	} else if (targetIsMod == true && isOwner == false) {
		return status;
	}

	const action = data["action"];
	let modActionData = {
		roomName: roomName,
		characterName: targetName,
		reason: data["msg"],
	};
	status.success = true;
	if (action == "kick") {
		let removeResult = await chatService.removeInRoom(roomName, targetName);
		if (removeResult > 0) {
			socket.to(roomName).emit("room user kicked", modActionData);
		}
	} else if (action == "add ban") {
		await chatService.removeInRoom(roomName, targetName);
		await chatService.addBanned(roomName, targetName);
		socket.to(roomName).emit("room user banned", modActionData);
	} else if (action == "remove ban") {
		await chatService.removeBanned(roomName, targetName);
		socket.to(roomName).emit("room user unbanned", modActionData);
	} else if (isOwner == true) {
		if (action == "add mod") {
			await chatService.addMod(roomName, targetName);
		} else if (action == "remove mod") {
			await chatService.removeMod(roomName, targetName);
		} else if (action == "switch owner") {
			await chatService.addMod(roomName, targetName);
			await chatService.switchOwner(roomName, targetName);
		}
	} else {
		status.msg = `Unhandled action ${action}`;
		status.success = false;
	}
	return status;
}

async function handle_setRoomSettings(socket, data) {
	logger.debug(`handling set room settings ${formatJson(data)}`);

	const roomName = data["roomName"];
	const characterName = data["characterName"];
	const isMod = await chatService.isMod(roomName, characterName);
	let status = { success: false, msg: "" };
	if (isMod == false) {
		return status;
	}

	if ("description" in data) {
		chatService.setDescription(roomName, data["description"]);
	}
	if ("password" in data) {
		chatService.setPassword(roomName, data["password"]);
	}
	if ("private" in data) {
		chatService.setPrivate(roomName, data["private"]);
	}
	status.success = true;
	return status;
}

module.exports = {
	setupSocket,
};
