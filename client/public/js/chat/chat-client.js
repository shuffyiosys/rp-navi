"use strict";
/**
 * @description This file handles all the AJAX related functionality.
 */

async function GeneratePBKDF(email, password) {
	let passphrase = new TextEncoder().encode(password);

	// Subtle Crypto only works in HTTPS settings, so if it's not there,
	// return a totally insecure Base64 concat as the password.
	if (Object.keys(window.crypto).length === 0) {
		console.log(btoa(password + email));
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

function PostAJAX(postURL, bodyData, callback) {
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
	fetch(postURL, headerData)
		.then((response) => {
			return response.json();
		})
		.then((response) => {
			if (typeof callback == "function") {
				callback(response);
			} else {
				console.log(response.json());
			}
		})
		.catch((error) => {
			console.log(error);
		});
}

function GetAJAX(postURL, callback) {
	fetch(postURL, {
		method: "get",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			return response.json();
		})
		.then((response) => {
			if (typeof callback == "function") {
				callback(response);
			} else {
				console.log(response.json());
			}
		})
		.catch((error) => {
			console.log(error);
		});
}

function SubmitLogin(username, password) {
	GeneratePBKDF(username, password).then((derivedPassword) => {
		const data = {
			email: username,
			password: derivedPassword,
		};
		PostAJAX("/account/login", data, (response) => {
			console.log(response);
		});
	});
}

function CreateAccount(username, password) {
	GeneratePBKDF(username, password).then((derivedPassword) => {
		const data = {
			email: username,
			password: derivedPassword,
		};
		PostAJAX("/account/create", data, (response) => {
			console.log(response);
		});
	});
}

function LogOut() {
	PostAJAX("/account/logout", { noRedirect: true }, (response) => {
		console.log(response);
	});
}

function AddCharacter(characterName) {
	PostAJAX("/character/create", { characterName: characterName }, (response) => {
		console.log(response);
	});
}

function DeleteCharacter(characterName) {
	PostAJAX("/character/delete", { characterName: characterName }, (response) => {
		console.log(response);
	});
}

document.addEventListener("DOMContentLoaded", () => {});
