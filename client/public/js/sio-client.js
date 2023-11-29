const socket = io();

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
	let joinRoomData = {
		roomName: roomName,
		characterName: characterName,
	};
	if (password) {
		joinRoomData["password"] = password;
	}
	socket.emit("join room", joinRoomData, (response) => {
		console.log("join room acked", response);
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
			console.log("leave room acked", response);
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
			console.log("post message acked", response);
		}
	);
}

function getRoomInfo(roomName, characterName = "", modRequest = false) {
	let getInfoData = {
		roomName: roomName,
	};
	if (characterName) {
		getInfoData.characterName = characterName;
	}
	if (modRequest) {
		getInfoData.modRequest = true;
	}
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

socket.on("room list", (resp) => console.log("Handling room list", resp));
socket.on("room info", (resp) => console.log("Handling room list", resp));
socket.on("room added", (resp) => console.log("Handling room added", resp));
socket.on("room removed", (resp) => console.log("Handling room removed", resp));
socket.on("room joined", (resp) => console.log("Handling room joined", resp));

socket.on("room user list", (resp) => console.log("Handling user list", resp));
socket.on("room user joined", (resp) => console.log("Handling room user joined", resp));
socket.on("room user kicked", (resp) => console.log("Handling user left", resp));
socket.on("room user banned", (resp) => console.log("Handling room user joined", resp));
socket.on("room user unbanned", (resp) => console.log("Handling user left", resp));

socket.on("room message posted", (resp) => console.log("Handling message posted", resp));
socket.on("room error", (resp) => console.log("Handling room error", resp));

socket.on("dm sent", (resp) => console.log("Handling DM sent", resp));
socket.on("dm received", (resp) => console.log("Handling DM received", resp));
socket.on("dm status", (resp) => console.log("Handling DM status", resp));

/* System events */
socket.on("disconnect", (resp) => console.log("Handling disconnect", resp));
socket.on("system message", (resp) => console.log("Handling system message", resp));
socket.on("character list", (resp) => console.log("Handling character list", resp));

socket.on("login error", (resp) => console.log("Handling login error", resp));
