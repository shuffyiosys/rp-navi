function sendAjaxPost(data, url, callback = updateStatus) {
	let postData = JSON.stringify(data);
	let xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onload = function () {
		if (xhr.status == 200) {
			callback(JSON.parse(this.response));
		}
	};

	xhr.send(postData);
}

function sendAjaxGet(url, callback = updateStatus) {
	let xhr = new XMLHttpRequest();

	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onload = function () {
		if (xhr.status == 200) {
			callback(JSON.parse(this.response));
		}
	};

	xhr.send();
}

function getInputValue(query) {
	return document.querySelector(query).value;
}

document.getElementById("loginSubmit").onclick = () => {
	const data = {
		email: getInputValue("#emailInput"),
		password: getInputValue("#passwordInput"),
	};
	sendAjaxPost(data, "/account/login");
};

document.getElementById("signupSubmit").onclick = () => {
	const data = {
		email: getInputValue("#emailInput"),
		password: getInputValue("#passwordInput"),
	};
	sendAjaxPost(data, "/account/create");
};

document.getElementById("forgotPassword").onclick = () => {
	const data = {
		email: getInputValue("#emailInput"),
	};
	sendAjaxPost(data, "/account/forgotPassword");
};

document.getElementById("forgotPassword").onclick = () => {
	const data = { newPassword: getInputValue("#resetPasswordInput") };
	const tokenInput = getInputValue("#resetTokenInput");
	sendAjaxPost(data, `/account/resetPassword?token=${tokenInput}`);
};

document.getElementById("logOutBtn").onclick = () => {
	sendAjaxPost({}, `/account/logout`);
};

document.getElementById("getData").onclick = () => {
	sendAjaxGet(`/account/data`);
};

document.getElementById("getVerification").onclick = () => {
	sendAjaxGet(`/account/resendVerify`);
};

document.getElementById("updateEmail").onclick = () => {
	const data = {
		newEmail: getInputValue("#newEmailInput"),
		password: getInputValue("#passwordInput"),
	};
	sendAjaxPost(data, `/account/resupdate-emailendVerify`);
};

document.getElementById("updatepasswordBtn").onclick = () => {
	const data = {
		newEmail: getInputValue("#newPasswordInput"),
		password: getInputValue("#passwordInput"),
	};
	sendAjaxPost(data, `/account/resupdate-password`);
};

document.getElementById("deleteAccountBtn").onclick = () => {
	const data = { password: getInputValue("#passwordInput") };
	sendAjaxPost(data, `/account/delete`);
};

document.getElementById("getCharactersBtn").onclick = () => {
	document.getElementById("characterList").replaceChildren();
	const characterRow = `
	<div class="flex-container">
		<div class="flex-items">
			<p>Character Name</p>
		</div>
		<div class="flex-items">
			<p>Actions</p>
		</div>
	</div>`;
	document.getElementById("characterList").insertAdjacentHTML("beforeend", characterRow);
	sendAjaxGet(`/character/list`, updateCharacterList);
};

document.getElementById("newCharacter").onclick = () => {
	const data = { password: getInputValue("#newCharacterInput") };
	sendAjaxPost(data, `/character/create`);
};

function updateStatus(response) {
	let statusMessage = document.getElementById("statusMessage");
	statusMessage.replaceChildren();

	const respType = document.createElement("li");
	const respMsg = document.createElement("li");
	const respDataHeader = document.createElement("li");
	const respData = document.createElement("ul");

	respType.append(`Type: ${response.type}`);
	respMsg.append(`Message: ${response.msg || "[No message]"}`);
	respDataHeader.append("Response data");

	console.log(response);

	if (Array.isArray(response.data)) {
		response.data.forEach((element) => {
			let listItem = document.createElement("li");
			listItem.append(`${JSON.stringify(element)}`);
			respData.append(listItem);
		});
	} else {
		for (const item in response.data) {
			let listItem = document.createElement("li");
			listItem.append(`${item}: ${response.data[item]}`);
			respData.append(listItem);
		}
	}
	statusMessage.appendChild(respType);
	statusMessage.appendChild(respMsg);
	statusMessage.appendChild(respDataHeader);
	statusMessage.appendChild(respData);
}

function updateCharacterList(response) {
	console.log(response);
	response.data.forEach((element) => {
		const characterRow = `
			<div class="flex-container">
				<div class="flex-items">
					<p>${element.characterName}</p>
				</div>
				<div class="flex-items">
					<p><button id="delete-${element.characterName}">Delete</button></p>
					<p><a href="/character/edit?character=${element.characterName}">Edit</a></p>
				</div>
			</div>`;

		document.querySelector("#characterList").insertAdjacentHTML("beforeend", characterRow);
		document.querySelector(`#delete-${element.characterName}`).onclick = () => {
			sendAjaxPost({ characterName: element.characterName }, "/character/delete");
		};
	});
	updateStatus(response);
}
