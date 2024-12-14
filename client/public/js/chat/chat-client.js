"use strict";

/**
 * @description This file handles all the AJAX related functionality.
 */

async function GeneratePBKDF(email, password) {
	let passphrase = new TextEncoder().encode(password);

	// Subtle Crypto only works in HTTPS settings, so if it's not there,
	// return a totally insecure Base64 concat as the password.
	if (Object.keys(window.crypto).length === 0) {
		return btoa(password + email);
	}

	// Import passphrase
	const importedKey = await window.crypto.subtle.importKey("raw", passphrase, { name: "PBKDF2" }, false, [
		"deriveBits",
	]);
	const keyBits = await window.crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			salt: new TextEncoder().encode(email),
			iterations: 10000,
		},
		importedKey,
		256
	);
	let base64 = btoa(new Uint8Array(keyBits).reduce((data, byte) => data + String.fromCharCode(byte), ""));
	return base64;
}

async function PostAJAX(postURL, bodyData) {
	const headerData = {
		method: "post",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: null,
	};

	if (bodyData !== null) {
		headerData.body = JSON.stringify(bodyData);
	}

	const response = await fetch(postURL, headerData);
	return response.json();
}

async function GetAJAX(getURL) {
	const headerData = {
		method: "get",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(getURL, headerData);
	return response.json();
}

function SubmitLogin(username, password) {
	GeneratePBKDF(username, password).then((derivedPassword) => {
		const data = {
			email: username,
			password: derivedPassword,
		};
		PostAJAX("/account/login", data)
			.then((response) => {
				if (response.success) {
					response.msg = "Login successful";
					socket.emit("logged in");
					GetCharacters();
				}
				UpdateConsole(response.msg, LOG_LEVEL.DEBUG);
			})
			.catch((error) => {
				console.log(`Error logging in:`, error);
			});
	});
}

function CreateAccount(username, password) {
	GeneratePBKDF(username, password).then((derivedPassword) => {
		const data = {
			email: username,
			password: derivedPassword,
		};
		PostAJAX("/account/create", data)
			.then((response) => {
				UpdateConsole(response.msg, LOG_LEVEL.DEBUG);
			})
			.catch((error) => {
				console.log(`Error logging in:`, error);
			});
	});
}

function LogOut() {
	PostAJAX("/account/logout", { noRedirect: true })
		.then((response) => {
			response.msg = "Logged out";
			UpdateConsole(response, LOG_LEVEL.DEBUG);
		})
		.catch((error) => {
			console.log(`Error logging in:`, error);
		});
}

function AddCharacter(characterName) {
	PostAJAX("/character/create", { characterName: characterName }).then((response) => {
		if (response.success) {
			response.msg = "AddCharacter Succeeded";
			AddToSelect("room-tab-character-select", characterName, characterName);
			AddToSelect("character-room-select", characterName, characterName);
		}
		UpdateConsole(response.msg, LOG_LEVEL.DEBUG);
	});
}

function GetCharacters() {
	GetAJAX("/character/list").then((response) => {
		if (response.success) {
			response.msg = "GetCharacters Succeeded";
			response.data.forEach((characterName) => {
				AddToSelect("character-select", characterName, characterName);
				charactersInRooms[characterName] = new Set();
			});
		} else {
			response.msg = "GetCharacters Failed";
		}
		UpdateConsole(response.msg, LOG_LEVEL.DEBUG);
	});
}

function DeleteCharacter(characterName) {
	PostAJAX("/character/delete", { characterName: characterName }).then((response) => {
		if (response.success) {
			response.msg = "DeleteCharacter Succeeded";
			RemoveInSelect("room-tab-character-select", characterName);
			RemoveInSelect("character-room-select", characterName);
		}
		UpdateConsole(response, LOG_LEVEL.DEBUG);
	});
}

document.addEventListener("DOMContentLoaded", () => {});
