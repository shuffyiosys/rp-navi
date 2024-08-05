"use strict";
document.addEventListener("DOMContentLoaded", (arg) => {
	function updateCharacterList(response) {
		console.log(response);
		response.data.forEach((characterName) => {
			populateCharacterRow(characterName);
		});
	}

	function populateCharacterRow(characterName, appendType = "beforeend") {
		const htmlName = characterName.toLowerCase().replaceAll(" ", "-");
		const characterRow = `
				<div id="${htmlName}-entry" class="flex-container">
					<div class="flex-item">
						<p><a href="/character/profile?name=${characterName}">${characterName}</a></p>
					</div>
					<div class="flex-item">
						<p>
							<button id="delete-${htmlName}">Delete</button> 
							<a href="/character/editor?character=${characterName}">Edit</a> 
							<a href="/character/editor-advanced?character=${characterName}">Edit (advanced)</a>
							</p>
					</div>
				</div>`;

		console.log(`#delete-${htmlName}`);
		document.querySelector("#character-list").insertAdjacentHTML(appendType, characterRow);
		document.querySelector(`#delete-${htmlName}`).onclick = () => {
			sendAjaxPost({ name: characterName }, "/character/delete", removeCharacterRow);
		};
	}

	function removeCharacterRow(response) {
		const htmlName = response.data.characterName.toLowerCase().replaceAll(" ", "-");
		document.getElementById(`${htmlName}-entry`).remove();
	}

	function createCharacter() {
		let msg = document.getElementById("create-character-msg");
		let nameInput = document.getElementById("new-character-input");

		if (nameInput.value.length == 0) {
			msg.innerHTML = "Enter a character name";
			msg.classList.add("error-label");
		} else {
			sendAjaxPost({ characterName: nameInput.value }, "/character/create", (response) => {
				console.log(response, msg);
				if (response.data.success) {
					populateCharacterRow(nameInput.value, "afterbegin");
					msg.innerHTML = "Character created";
					msg.classList.remove("error-label");
				} else {
					msg.innerHTML = response.msg;
					msg.classList.add("error-label");
				}
			});
		}
	}

	document.getElementById("create-character-btn").onclick = createCharacter;

	document.getElementById("character-list").replaceChildren();
	const characterRow = `
	<div class="flex-container">
		<div class="flex-item">
			<p>Character Name</p>
		</div>
		<div class="flex-item">
			<p>Actions</p>
		</div>
	</div>`;
	document.getElementById("character-list").insertAdjacentHTML("beforeend", characterRow);
	sendAjaxGet(`/character/list`, updateCharacterList);
});
