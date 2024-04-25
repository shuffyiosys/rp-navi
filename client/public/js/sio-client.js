const socket = io();
var characterList = [];

/* Room functions */
function getRooms() {
	socket.emit("get rooms", null, (response) => {
		console.log("get rooms acked", response);
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
		const data = response.data;
		addRoomTabEntry(data.characterName, data.roomName);
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
			const data = response.data;
			removeRoomTabEntry(data.characterName, data.roomName);
		}
	);
}

function postChatMessage(roomName, characterName, message) {
	socket.volatile.emit("post message", {
		roomName: roomName,
		characterName: characterName,
		message: message,
	});
}

function getRoomInfo(roomName, characterName = "", modRequest = false) {
	let getInfoData = {
		roomName: roomName,
	};
	if (characterName.length > 0 && modRequest == true) {
		getInfoData.characterName = characterName;
		getInfoData.modRequest = true;
	}
	socket.emit("get room info", getInfoData, (response) => {
		console.log("get room info acked", response);
	});
}

function getRoomData(roomName, characterName) {
	let getInfoData = {
		roomName: roomName,
	};
	if (characterName.length > 0 && modRequest == true) {
		getInfoData.characterName = characterName;
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

/* Room handlers */
function populateRoomList(resp) {
	$(`#room-list`).empty();
	resp.forEach((roomName) => {
		const roomNameId = roomName.replaceAll(" ", "-").toLowerCase() + "-room";

		$(`#room-list`).append(
			`<p data-roomname="${roomName}"><input id="${roomNameId}" type="radio"> <label for="${roomNameId}">${roomName}</label></p>`
		);
	});
}

socket.on("room list", populateRoomList);
socket.on("room info", (resp) => console.log("Handling room info", resp));
socket.on("room added", (resp) => console.log("Handling room added", resp));
socket.on("room removed", (resp) => console.log("Handling room removed", resp));

socket.on("room user list", (resp) => console.log("Handling user list", resp));
socket.on("room user joined", (resp) => console.log("Handling room user joined", resp));
socket.on("room user kicked", (resp) => console.log("Handling user left", resp));
socket.on("room user banned", (resp) => console.log("Handling room user joined", resp));
socket.on("room user unbanned", (resp) => console.log("Handling user left", resp));

socket.on("room error", (resp) => console.log("Handling room error", resp));

/* DM functions */
const DM_STATUSES = {
	none: 0,
	typing: 1,
	hasTyped: 2,
};

function sendDm(fromCharacter, toCharacter, message) {
	socket.emit(
		"send dm",
		{
			fromCharacter: fromCharacter,
			toCharacter: toCharacter,
			message: message,
		},
		(response) => {
			console.log("send dm acked", response);
		}
	);
}

function sendDmStatus(fromCharacter, toCharacter, status) {
	socket.emit(
		"send dm-status",
		{
			fromCharacter: fromCharacter,
			toCharacter: toCharacter,
			status: status,
		},
		(response) => {
			console.log("send dm status acked", response);
		}
	);
}

socket.on("dm message", (resp) => console.log("Handling DM received", resp));
socket.on("dm status", (resp) => console.log("Handling DM status", resp));

/* User functions */
const USER_STATUSES = {
	online: 0,
	idle: 1,
	busy: 2,
	offline: 3,
};

function updateStatus(character, newStatus) {
	socket.emit("update status", {
		character: character,
		newStatus: newStatus,
	});
}

function blockUser(character, blockedCharacter) {
	socket.emit(
		"block user",
		{
			requester: character,
			recipient: blockedCharacter,
		},
		(response) => {
			console.log("block user acked", response);
		}
	);
}

function unblockUser(character, blockedCharacter) {
	socket.emit(
		"unblock user",
		{
			requester: character,
			recipient: blockedCharacter,
		},
		(response) => {
			console.log("unblock user acked", response);
		}
	);
}

function addFriend(character, friendCharacter) {
	socket.emit(
		"add friend",
		{
			requester: character,
			recipient: friendCharacter,
		},
		(response) => {
			console.log("friend user acked", response);
		}
	);
}

function removeFriend(character, friendCharacter) {
	socket.emit(
		"remove friend",
		{
			requester: character,
			recipient: friendCharacter,
		},
		(response) => {
			console.log("unfriend user acked", response);
		}
	);
}

socket.on("user status update", (resp) => console.log("Handling user status update", resp));
socket.on("friend requested", (resp) => console.log("Handling friend request", resp));

/* System events */
socket.on("disconnect", (resp) => console.log("Handling disconnect", resp));
socket.on("system message", (resp) => console.log("Handling system message", resp));
socket.on("character list", (resp) => {
	logMessage(resp);
	characterList = [];
	resp.forEach((data) => {
		characterList.push(data.charaName);
	});
});

socket.on("login error", (resp) => console.log("Handling login error", resp));

socket.onAny((eventName, ...args) => {
	console.log(`Handling ${eventName}`);
});
