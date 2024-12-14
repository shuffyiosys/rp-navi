"use strict";
/**
 * @description This file handles chat UI functionality
 */

const LOG_LEVEL = {
	CRITICAL: 0,
	ERROR: 1,
	WARNING: 2,
	INFO: 3,
	DEBUG: 4,
};

const LOG_LEVEL_STRING = {
	0: "critical",
	1: "error",
	2: "warn",
	3: "info",
	4: "debug",
};

const LOGGING_LEVEL = LOG_LEVEL.DEBUG;

function GetFormattedTime() {
	const date = new Date();
	let minutes = date.getMinutes();
	minutes = minutes < 10 ? `0${minutes}` : minutes;
	return `${date.getHours()}:${minutes}`;
}

function UpdateConsole(message, level = LOG_LEVEL.INFO) {
	if (LOGGING_LEVEL < level) {
		return;
	}
	const messageEl = document.createElement("code");
	const output = `[${GetFormattedTime()}] ${LOG_LEVEL_STRING[level]} - ${message}`;
	console.log(output);
	messageEl.innerText = output;
	document.getElementById("system-msgs-page").appendChild(messageEl);
	document.getElementById("system-msgs-page").appendChild(document.createElement("br"));
}

function AddToSelect(selectID, optionValue, optionLabel) {
	const selectEl = document.getElementById(selectID);

	if (selectEl === null) {
		return;
	}

	const optionItem = document.createElement("option");
	optionItem.innerHTML = optionLabel;
	optionItem.value = optionValue;
	selectEl.appendChild(optionItem);
}

function RemoveInSelect(selectID, optionValue) {
	const selectEl = document.getElementById(selectID);
	for (let i = 0; i < selectEl.length; i++) {
		if (selectEl[i].value == optionValue) {
			selectEl[i].remove();
			break;
		}
	}
}

function CreateMessagePage(roomName) {
	if (document.getElementById(`${roomName}-page`) !== null) {
		return;
	}

	const newPage = document.createElement("div");
	roomName = roomName.toLowerCase().replaceAll(" ", "-");
	newPage.id = `${roomName}-page`;
	newPage.classList.add("msg-page");

	const pagesContainer = document.getElementById("chat-messages");
	pagesContainer.appendChild(newPage);
}

function SwitchMessagePage(roomName) {
	const cssRoomName = roomName.toLowerCase().replaceAll(" ", "-");
	if (document.querySelectorAll(`.msg-page[selected="yes"]`).length > 0) {
		document.querySelectorAll(`.msg-page[selected="yes"]`)[0].removeAttribute("selected");
	}
	document.getElementById(`${cssRoomName}-page`).setAttribute("selected", "yes");

	if (cssRoomName == "system-msgs") {
		document.getElementById("leave-room-btn").setAttribute("disabled", "");
		document.getElementById("leave-room-btn").removeAttribute("for-room");
		document.getElementById(`chat-input`).setAttribute("disabled", "");
	} else {
		document.getElementById("leave-room-btn").removeAttribute("disabled");
		document.getElementById("chat-input").removeAttribute("disabled");
		document.getElementById(`chat-input`).setAttribute("for-room", roomName);
	}
}

function AddMessageToPage(roomName, message) {
	const messageEl = document.createElement("p");
	roomName = roomName.toLowerCase().replaceAll(" ", "-");
	messageEl.innerText = `[${GetFormattedTime()}] ${message}`;
	document.getElementById(`${roomName}-page`).appendChild(messageEl);
}

function DeleteMessagePage(roomName) {
	roomName = roomName.toLowerCase().replaceAll(" ", "-");
	console.log(document.getElementById(`${roomName}-page`));
	if (document.getElementById(`${roomName}-page`) !== null) {
		document.getElementById(`${roomName}-page`).remove();
	}
}

/* UI Handlers */
function LoginBtnHandler() {
	SubmitLogin(
		document.getElementById("login-email-input").value,
		document.getElementById("login-password-input").value
	);
}

function LogoutBtnHandler() {
	LogOut();
}

function SignupBtnHandler() {
	CreateAccount(
		document.getElementById("login-email-input").value,
		document.getElementById("login-password-input").value
	);
}

function CreateCharacterBtnHandler() {
	AddCharacter(document.getElementById("character-name-input").value);
}

function DeleteCharacterBtnHandler() {
	DeleteCharacter(document.getElementById("character-name-input").value);
}

function RoomSelectHandler() {
	const roomSelect = document.getElementById("room-select");
	SwitchMessagePage(roomSelect[roomSelect.selectedIndex].value);
}

function CreateRoomBtnHandler() {
	const characterSelect = document.getElementById("character-select");
	console.log(
		"Creating room:",
		document.getElementById("new-roomname-input").value,
		characterSelect[characterSelect.selectedIndex].value
	);
	createRoom(
		document.getElementById("new-roomname-input").value,
		characterSelect[characterSelect.selectedIndex].value
	);
}

function JoinRoomBtnHandler() {
	const characterSelect = document.getElementById("character-select");
	const roomSelect = document.getElementById("room-list-select");
	joinRoom(
		roomSelect[roomSelect.selectedIndex].value,
		characterSelect[characterSelect.selectedIndex].value
	);
}

function LeaveRoomBtnHandler() {
	const characterSelect = document.getElementById("character-select");
	const roomSelect = document.getElementById("room-select");
	leaveRoom(
		roomSelect[roomSelect.selectedIndex].value,
		characterSelect[characterSelect.selectedIndex].value
	);
}

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("chat-input").onkeydown = (event) => {
		if (event.key == "Enter" && !event.shiftKey) {
			const roomName = document.getElementById("chat-input").getAttribute("for-room");
			const characterSelect = document.getElementById("character-select");
			const characterName = characterSelect[characterSelect.selectedIndex].value;
			postChatMessage(roomName, characterName, document.getElementById("chat-input").value);
			event.preventDefault();
		}
	};
});
