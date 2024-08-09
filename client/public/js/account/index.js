"use strict";
document.addEventListener("DOMContentLoaded", (arg) => {
	/** Account stats update */
	function handleAccountUpdateResponse(response) {
		if (response.type == "error") {
		}
	}

	document.getElementById("update-email-btn").onclick = () => {
		const data = {
			newEmail: getInputValue("#new-email-input"),
			password: getInputValue("#password-input"),
		};

		document.getElementById("password-error").innerHTML = "&#8203;";
		document.getElementById("new-email-error").innerHTML = "&#8203;";

		if (!data.newEmail) {
			document.getElementById("new-email-error").innerHTML = "Enter a new email address";
		} else if (!data.password) {
			document.getElementById("password-error").innerHTML = "Enter your password";
		} else if (data.newEmail.search(/.+@\S+\.\S+/) == -1) {
			document.getElementById("new-email-error").innerHTML = "Invalid email format entered";
		} else {
			sendAjaxPost(data, `/account/update-email`);
		}
	};

	document.getElementById("update-password-btn").onclick = () => {
		const data = {
			newPassword: getInputValue("#new-password-input"),
			password: getInputValue("#password-input"),
		};

		document.getElementById("password-error").innerHTML = "&#8203;";
		document.getElementById("new-password-error").innerHTML = "&#8203;";

		if (!data.newPassword) {
			document.getElementById("new-password-error").innerHTML = "Enter a new password";
		}
		if (data.newPassword.length < 8) {
			document.getElementById("new-password-error").innerHTML = "New password must be at least 8 characters";
		} else if (!data.password) {
			document.getElementById("password-error").innerHTML = "Enter your password";
		} else {
			sendAjaxPost(data, `/account/update-password`);
		}
	};

	/** Character updating */
	function updateCharacterList(response) {
		response.data.forEach((characterName) => {
			populateCharacterRow(characterName);
		});
	}

	function populateCharacterRow(characterName, appendType = "beforeend") {
		const htmlName = characterName.toLowerCase().replaceAll(" ", "-");
		// let characterRow = `<div id="${htmlName}-entry" class="flex-container">
		// 			<div class="flex-item">
		// 				<p><a href="/character/profile?name=${characterName}">${characterName}</a></p>
		// 			</div>
		// 			<div class="flex-item">
		// 				<p>
		// 					<a href="/character/editor?character=${characterName}" style="margin-right: 2rem;">Edit</a>
		// 					<button id="delete-${htmlName}" class="btn btn-danger" data-clicks="0">Delete</button>
		// 					</p>
		// 			</div>
		// 		</div>`;

		// characterRow = characterRow.replaceAll("\n", "");
		// characterRow = characterRow.replaceAll("\t", "");

		let characterRow = document.createElement("div");
		characterRow.id = `${htmlName}-entry`;
		characterRow.classList.add("flex-container");
		characterRow.innerHTML = `
			<div class="flex-item">
				<p><a href="/character/profile?name=${characterName}">${characterName}</a></p>
			</div>
			<div class="flex-item">
				<p>
					<a href="/character/editor?character=${characterName}" style="margin-right: 2rem;">Edit</a>
					<button id="delete-${htmlName}" class="btn btn-danger" data-clicks="0">Delete</button>
					</p>
			</div>`;

		let characterList = document.getElementById("character-list");
		let rowInserted = false;
		for (let i = 0; i < characterList.childNodes.length && !rowInserted; i++) {
			let node = characterList.childNodes[i];
			let idText = node.getAttribute("id");

			console.log(idText, htmlName, htmlName < idText);
			if (idText && htmlName < idText) {
				rowInserted = true;
				characterList.insertBefore(characterRow, characterList.childNodes[i]);
				break;
			}
		}

		if (!rowInserted) {
			document.querySelector("#character-list").insertAdjacentHTML(appendType, characterRow.outerHTML);
		}

		// document.querySelector("#character-list").insertAdjacentHTML(appendType, characterRow);
		const deleteCharacterBtn = document.querySelector(`#delete-${htmlName}`);
		deleteCharacterBtn.onclick = () => {
			handleDeleteBtn(deleteCharacterBtn, characterName);
		};
	}

	function handleDeleteBtn(button, characterName) {
		let clicks = parseInt(button.getAttribute("data-clicks"));
		let timer = null;
		if (clicks == 0) {
			let seconds = 5;
			clicks++;
			button.setAttribute("data-clicks", clicks);
			button.innerHTML = "Click again to delete (5s)";
			timer = setInterval(() => {
				if (seconds == 0) {
					button.setAttribute("data-clicks", 0);
					button.innerHTML = "Delete";
					clearInterval(timer);
				} else {
					button.innerHTML = `Click again to delete (${seconds}s)`;
					seconds--;
				}
			}, 1000);
		} else {
			if (timer) {
				clearInterval(timer);
			}
			button.innerHTML = "Delete";
			sendAjaxPost({ name: characterName }, "/character/delete", removeCharacterRow);
		}
	}

	function removeCharacterRow(response) {
		console.log(response);
		if (response.data.deletedCount == 1) {
			const htmlName = response.data.characterName.toLowerCase().replaceAll(" ", "-");
			document.getElementById(`${htmlName}-entry`).remove();
		}
	}

	function createCharacter() {
		let msg = document.getElementById("create-character-msg");
		let nameInput = document.getElementById("new-character-input");

		if (nameInput.value.length == 0) {
			msg.innerHTML = "Enter a character name";
			msg.classList.add("error-label");
		} else {
			sendAjaxPost({ characterName: nameInput.value }, "/character/create", (response) => {
				if (response.data.success) {
					populateCharacterRow(nameInput.value);
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
	document.getElementById("new-character-input").onkeydown = (ev) => {
		if (ev.key == "Enter") {
			createCharacter();
		}
	};

	document.getElementById("character-list").replaceChildren();
	let characterRow = `
	<div class="flex-container">
		<div class="flex-item">
			<p>Character Name</p>
		</div>
		<div class="flex-item">
			<p>Actions</p>
		</div>
	</div>`;
	characterRow = characterRow.replaceAll("\n", "");
	characterRow = characterRow.replaceAll("\t", "");
	document.getElementById("character-list").insertAdjacentHTML("beforeend", characterRow);
	sendAjaxGet(`/character/list`, updateCharacterList);
});
