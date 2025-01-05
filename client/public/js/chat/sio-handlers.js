"use strict";
/**
 * @description This file handles all Socket.IO functionality
 */
const socket = io();
const charactersInRooms = {};
const joinedRooms = {};
const roomsList = new Set();

document.addEventListener("DOMContentLoaded", (arg) => {
	function defaultHandler(response) {
		// TODO: How do we handle server disconnection/reconnection?
		console.log(response);
	}

	/* System events */
	socket.on("connect", () => {
		console.log("Connected:", socket.id);
	});

	socket.on("disconnect", (resp) => {
		console.log("Disconnected:", resp);
		UpdateConsole(resp);
	});

	socket.on("login status", (response) => {
		if (response.loggedIn) {
			GetCharacters();
		}
	});

	socket.on("system message", (resp) => {
		console.log("Received system message", resp);
		UpdateConsole(resp);
	});

	/* Account events */
	socket.on("user status update", (resp) => console.log("Handling user status update", resp));
	socket.on("friend requested", (resp) => console.log("Handling friend request", resp));

	/* DM events */
	socket.on("dm message", (resp) => console.log("Handling DM received", resp));
	socket.on("dm status", (resp) => console.log("Handling DM status", resp));

	/* Chat room events */
	socket.on("room list", (resp) => {
		UpdateConsole("Received rooms", LOG_LEVEL.DEBUG);
		// TODO: Make this update the roomlist instead of add to it
		resp.forEach((roomName) => {
			roomsList.add(roomName);
			AddToSelect("room-list-select", roomName, roomName);
		});
	});
	socket.on("room message posted", (resp) => {
		const message = `${resp.characterName}: ${resp.message}`;
		UpdateConsole(message, LOG_LEVEL.DEBUG);
		AddMessageToPage(resp.roomName, message);
	});
	socket.on("room info", (resp) => {
		console.log("Received room info:", resp);
	});

	socket.on("room added", (resp) => {
		AddToSelect("room-list-select", resp.roomName, resp.roomName);
		UpdateConsole(`${resp.roomName} was added`, LOG_LEVEL.DEBUG);
	});

	socket.on("room removed", (resp) => {
		RemoveInSelect("room-list-select", resp.roomName, resp.roomName);
		UpdateConsole(`${resp.roomName} was removed`, LOG_LEVEL.DEBUG);
	});

	socket.on("user left", (resp) => {
		const { characterName, roomName } = resp;
		const message = `${characterName} left ${roomName}`;
		UpdateConsole(message, LOG_LEVEL.DEBUG);
		AddMessageToPage(roomName, message);
		removeInUserList(characterName, roomName);
	});

	socket.on("user joined", (resp) => {
		const { characterName, roomName } = resp;
		const message = `${characterName} entered ${roomName}`;
		addToUserList(characterName, roomName);
		AddMessageToPage(roomName, message);
		UpdateConsole(message, LOG_LEVEL.DEBUG);
	});

	socket.on("user kicked", (resp) => console.log("Handling user kicked", resp));
	socket.on("user banned", (resp) => console.log("Handling user banned", resp));

	socket.on("user unbanned", (resp) => console.log("Handling user unbanned", resp));

	socket.on("room error", (resp) => console.log("Handling room error", resp));

	socket.on("kicked", (resp) => console.log("Handling kicked", resp));
});

function getRooms() {
	socket.emit("get rooms", null, (response) => {
		console.log(`Recevied rooms: `, response);
		UpdateConsole("Received rooms", LOG_LEVEL.DEBUG);
		response.forEach((roomName) => {
			AddToSelect("room-list-select", roomName, roomName);
		});
	});
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
			if (response.success) {
				charactersInRooms[characterName].add(roomName);
				AddToSelect("room-select", roomName, roomName);
				AddToSelect("room-list-select", roomName, roomName);
				CreateMessagePage(roomName);
				AddMessageToPage(roomName, `You joined ${roomName} as ${characterName}`);
				document
					.querySelectorAll(`#room-select > option[value="${roomName}"]`)[0]
					.setAttribute("selected", true);
				SwitchMessagePage(roomName);

				UpdateConsole(`${characterName} created ${roomName}`, LOG_LEVEL.DEBUG);
			} else {
				UpdateConsole(response.msg, LOG_LEVEL.INFO);
			}
		}
	);
}

function joinRoom(roomName, characterName, password = "") {
	console.log(`Joining ${roomName} as ${characterName}`);
	if (charactersInRooms[characterName].has(roomName)) {
		UpdateConsole(`${characterName} is already in ${roomName}`, LOG_LEVEL.DEBUG);
		return;
	}

	let joinRoomData = {
		roomName: roomName,
		characterName: characterName,
	};
	if (password) {
		joinRoomData["password"] = password;
	}
	socket.emit("join room", joinRoomData, (response) => {
		console.log(response);
		if (!response.success) {
			UpdateConsole(response.msg, LOG_LEVEL.INFO);
			return;
		}
		charactersInRooms[characterName].add(roomName);
		if (!(roomName in joinedRooms)) {
			joinedRooms[roomName] = 1;
			AddToSelect("room-select", roomName, roomName);
			CreateMessagePage(roomName);
			createUserList(response.data.users, roomName);
		} else {
			addToUserList(characterName, roomName);
			joinedRooms[roomName]++;
		}
		AddMessageToPage(roomName, `You joined ${roomName} as ${characterName}`);
		document.querySelectorAll(`#room-select > option[value="${roomName}"]`)[0].setAttribute("selected", true);
		SwitchMessagePage(roomName);
		UpdateConsole(`${characterName} joined ${roomName}`, LOG_LEVEL.DEBUG);
	});
}

function leaveRoom(roomName, characterName) {
	socket.emit("leave room", { roomName: roomName, characterName: characterName }, (response) => {
		if (!response.success) {
			UpdateConsole(response.msg, LOG_LEVEL.INFO);
			return;
		}

		charactersInRooms[characterName].delete(roomName);
		joinedRooms[roomName]--;
		removeInUserList(characterName, roomName);

		if (joinedRooms[roomName] <= 0) {
			SwitchMessagePage("system-msgs");
			RemoveInSelect("room-select", roomName, roomName);
			removeUserList(roomName);
			DeleteMessagePage(roomName);
		}
		UpdateConsole(`${characterName} left ${roomName}`, LOG_LEVEL.DEBUG);
	});
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
			if (response.success) {
				const formattedMessage = `${characterName}: ${message}`;
				AddMessageToPage(roomName, formattedMessage);
				document.getElementById("chat-input").value = "";
			}
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
