"use strict";
const LOG_LEVEL = 5;

function logMessage(message, level = 5) {
	if (level <= LOG_LEVEL) {
		console.log(message);
	}
}

/* UI Generators */
function addRoomTabEntry(character, room) {
	/* If character group not created, make it */
	const group = $(`div.character-tab[data-character="${character}"]`);
	let entryHtml = `<p data-room="${room}">${room} <span style="color: red;"><i class="bi bi-x-square-fill"></i></span></p>`;

	if (group.length == 0) {
		const html = `<div class="character-tab" data-character="${character}">
			<p class="header">${character}</p>
			${entryHtml}
			</div>`;
		$(`div.room-tabs`).append(html);
		$(`div.character-tab[data-character=${character}]`).on("click", toggleCharacterTab);
	}

	/* If room not in group, add it. */
	const rooms = $(`div.character-tab[data-character="${character}"] p[data-room="${room}"]`);
	if (rooms.length == 0) {
		group.append(entryHtml);
	}

	$(`p[data-room="${room}"] > span`).on("click", () => {
		leaveRoom(room, character);
	});
}

function removeRoomTabEntry(character, room) {
	/* If room not in group, add it. */
	$(`div.character-tab[data-character="${character}"] p[data-room="${room}"]`).remove();

	/* If character group not created, make it */
	const characterTab = $(`div.character-tab[data-character="${character}"]`);
	if (characterTab.children().length == 1) {
		characterTab.remove();
	}
}

function addCharacterToList(character) {
	const characterEntry = $(`div.room-user-list div[data-character="${character}"]`);
	if (characterEntry.length == 0) {
		$(`div.room-user-list`).append(`<div class="chat-message" data-character="${character}">${character}</div>`);
	}
}

function removeCharacterToList(character) {
	$(`div.room-user-list div[data-character="${character}"]`).remove();
}

/* General UI handlers *******************************************************/
function toggleCharacterTab(data) {
	$(data.target).siblings().toggle();
}

function toggleUserList() {
	$("div.right-sidebar").toggle();

	const col = $("div.main-page")[0].classList[1];
	if (col == "col-8") {
		$("div.main-page").removeClass("col-8");
		$("div.main-page").addClass("col-10");
	} else {
		$("div.main-page").removeClass("col-10");
		$("div.main-page").addClass("col-8");
	}
}

/* Specific UI handlers */
function handleJoinRoom() {
	const roomDom = $(`#room-list input[type=radio]:checked`).parent();
	const roomName = roomDom[0].dataset[`roomname`];
	const characterName = $(`#join-character-list input[type=radio]:checked`).val();
	joinRoom(roomName, characterName);

	$(`#lfrp-modal`).modal("hide");
}

function handleCreateRoom(event) {}

function handleMessageInput(event) {
	let code = event.keyCode ? event.keyCode : event.which;
	if (!event.shiftKey && $(event.target).val().length > 0 && code == 13) {
		const chatMessage = $(event.target).val();
		const html = `<div class="chat-message">${chatMessage.replaceAll("\n", "<br />")}</div>`;
		$("div.message-list").append(html);

		$(event.target).val("");
		const msgList = $("div.message-section");
		msgList.scrollTop(msgList.prop("scrollHeight"));

		const roomName = "";
		const character = "";
		postChatMessage(roomName, character, chatMessage);
	}
}

$("div.character-tab p.header").on("click", toggleCharacterTab);

$("div.input-section textarea").on("keyup", handleMessageInput);

$("button.user-list-toggle").on("click", toggleUserList);

$(`#join-room-btn`).on(`click`, handleJoinRoom);
