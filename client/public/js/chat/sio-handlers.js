"use strict";

const socket = io();
function defaultHandler(response) {
	console.log(response);
}

document.addEventListener("DOMContentLoaded", (arg) => {
	/* System events */
	socket.on("connect", () => {
		console.log(socket.id);
	});
	socket.on("disconnect", defaultHandler);

	socket.on("login error", () => {
		console.log("Not logged in");
	});

	socket.on("system message", (resp) => console.log("Handling system message", resp));

	/* Account events */
	socket.on("user status update", (resp) => console.log("Handling user status update", resp));
	socket.on("friend requested", (resp) => console.log("Handling friend request", resp));

	/* Character events */
	socket.on("character list", defaultHandler);

	/* DM events */
	socket.on("dm message", (resp) => console.log("Handling DM received", resp));
	socket.on("dm status", (resp) => console.log("Handling DM status", resp));

	/* Chat room events */
	socket.on("room list", defaultHandler);
	socket.on("room message posted", (resp) => console.log("Handling room message posted", resp));
	socket.on("room info", (resp) => console.log("Handling room info", resp));
	socket.on("room added", (resp) => console.log("Handling room added", resp));
	socket.on("room removed", (resp) => console.log("Handling room removed", resp));

	socket.on("user left", (resp) => console.log("Handling user left", resp));
	socket.on("user joined", (resp) => console.log("Handling user joined", resp));
	socket.on("user kicked", (resp) => console.log("Handling user kicked", resp));
	socket.on("user banned", (resp) => console.log("Handling user banned", resp));

	socket.on("user unbanned", (resp) => console.log("Handling user unbanned", resp));

	socket.on("room error", (resp) => console.log("Handling room error", resp));

	socket.on("kicked", (resp) => console.log("Handling kicked", resp));

	socket.emit("get owned characters", {}, defaultHandler);

	socket.emit("get rooms", null, (response) => {
		console.log("get rooms acked", response);
	});
});

function getRooms() {
	socket.emit("get rooms", null, (response) => {
		console.log("get rooms acked", response);
	});
}

function getCharacters() {
	socket.emit("get owned characters", {}, defaultHandler);
}

function createRoom(roomName, characterName, description = "", privateRoom = false, password = "") {
	socket.emit(
		"create room",
		{
			roomName: roomName,
			characterName: characterName,
			description: description,
			privateRoom: privateRoom,
			password: password,
		},
		(response) => {
			console.log("create room acked", response);
		}
	);
}

function joinRoom(roomName, characterName, password = "") {
	console.log(roomName, characterName);
	let joinRoomData = {
		roomName: roomName,
		characterName: characterName,
	};
	if (password) {
		joinRoomData["password"] = password;
	}
	socket.emit("join room", joinRoomData, (response) => {
		console.log(response);
	});
}

function leaveRoom(roomName, characterName) {
	socket.emit(
		"leave room",
		{
			roomName: roomName,
			characterName: characterName,
		},
		(response) => {
			console.log(response);
		}
	);
}

function postChatMessage(roomName, characterName, message) {
	socket.emit(
		"post message",
		{
			roomName: roomName,
			characterName: characterName,
			message: message,
		},
		(response) => {
			console.log("post message ack", response);
		}
	);
}

function getRoomInfo(roomName, characterName = "") {
	let getInfoData = {
		roomName: roomName,
		characterName: characterName,
	};
	socket.emit("get room info", getInfoData, (response) => {
		console.log("get room info acked", response);
	});
}

function modAction(roomName, modName, targetName, action, reasonMsg) {
	socket.emit(
		"mod action",
		{
			roomName: roomName,
			characterName: modName,
			targetName: targetName,
			action: action,
			reasonMsg: reasonMsg,
		},
		(response) => {
			console.log("mod action acked", response);
		}
	);
}

function updateRoomSettings(roomName, modName, roomSettings) {
	let updateData = {
		roomName: roomName,
		characterName: modName,
	};

	Object.assign(updateData, roomSettings);
	socket.emit("set room settings", updateData, (response) => {
		console.log("mod action acked", response);
	});
}
