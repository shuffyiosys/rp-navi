const { ChatroomData } = require("../classes/chatroom-data");

let chatRooms = {};

function validateData(data, keys) {
	let dataValid = false;

	if (data) {
		dataValid = true;
	}

	if (dataValid == true) {
		for (let i = 0; i < keys.length && dataValid; keys++) {
			dataValid = keys[i] in data;
		}
	}

	return dataValid;
}

function setupSocket(io, socket, redisClient) {
	socket.join("System");
	// socket.emit("room list", getRoomList());
	// socket.emit("name list", { names: [username] });
	// socket.emit("info", createInfoMsg("Welcome to RP Navi!"));

	socket.on("disconnect", function () {
		handle_disconnect(socket);
	});

	socket.on("join room", function (data, ack) {
		if (validateData(data, ["roomName", "characterName"]) == true) {
			handle_joinRoom(socket, data, redisClient);
		}
		ack({ status: true });
	});

	socket.on("leave room", function (data, ack) {
		if (validateData(data, ["roomName", "characterName"]) == true) {
			handle_leaveRoom(socket, data);
		}
		ack({ status: true });
	});

	socket.on("post message", function (data, ack) {
		let status = {success: false, msg: ""};
		if (validateData(data, ["roomName", "characterName", "message"]) == true) {
			status = handle_postMessage(socket, data);
		}
		ack(status);
	});

	socket.on("get room info", (data) => {
		handle_getRoomInfo(socket, data);
	});

	socket.on("mod action", (data) => {
		handle_modAction(io, socket, data);
	});

	socket.on("set room settings", (data) => {
		handle_setRoomSettings(socket, data);
	});
}

function getRoomList() {
	console.log("Getting room list");
}

function handle_disconnect(socket) {
	console.log("handling disconnect");
}

function handle_joinRoom(socket, data, redisClient) {
	let status = {success: false, msg: ""};
	console.log("handling join room");

	// Deny entry if banned, or character + socket is already in room

	socket.join(data.roomName);
	socket
		.to(data.roomName)
		.emit("user joined", { characterName: data.characterName });
}

function handle_leaveRoom(socket, data) {
	console.log("handling leave room");
	socket.leave(data.roomName);
	socket
		.to(data.roomName)
		.emit("user left", { characterName: characterName });
}

function handle_postMessage(socket, data) {
	let status = {success: false, msg: ""};
	console.log("handling post message");
	if (socket.rooms.has(data.roomName)) {
		socket.to(data.roomName).emit("message posted", data);
		status.success = true;
	}
	else {
		status.msg = "Not in room";
	}
	return status;
}

function handle_getRoomInfo(socket, data) {
	console.log("handling get room info");
}

function handle_modAction(io, socket, data) {
	console.log("handling mod action");
}

function handle_setRoomSettings(socket, data) {
	console.log("handling set room settings");
}

module.exports = {
	setupSocket,
};
