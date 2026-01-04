"use strict";

document.addEventListener("DOMContentLoaded", (arg) => {
	async function generatePBKDF(email, password) {
		let passphrase = new TextEncoder().encode(password);

		// Subtle Crypto only works in HTTPS settings, so if it's not there,
		// return a totally insecure Base64 concat as the password.
		if (Object.keys(window.crypto).length === 0) {
			console.log("HTTP password:", btoa(password + email));
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
		console.log("raw key:", new Uint8Array(keyBits));
		let base64 = btoa(new Uint8Array(keyBits).reduce((data, byte) => data + String.fromCharCode(byte), ""));
		return base64;
	}

	function submitLogin() {
		let errors = false;
		let errLabel = document.getElementById("email-error");
		errLabel.innerHTML = "&#8203;";
		errLabel.style.display = "none";
		if (document.getElementById("email-input").value.length === 0) {
			errLabel.innerHTML = "No email entered";
			errors = true;
			errLabel.style.display = "block";
		}

		errLabel = document.getElementById("password-error");
		errLabel.innerHTML = "&#8203;";
		errLabel.style.display = "none";
		if (document.getElementById("password-input").value.length == 0) {
			errLabel.innerHTML = "No password entered";
			errors = true;
			errLabel.style.display = "block";
		}

		errLabel = document.getElementById("error-message");
		errLabel.innerHTML = "&#8203;";
		if (!errors) {
			generatePBKDF(getInputValue("#email-input"), getInputValue("#password-input")).then((derivedPassword) => {
				const data = {
					email: getInputValue("#email-input"),
					password: derivedPassword,
				};
				sendAjaxPost(data, "/account/login", (response) => {
					const reponseData = JSON.parse(response);
					if (!reponseData.success) {
						errLabel.innerHTML = "Error logging in";
					} else {
						location.reload();
					}
				});
			});
		}
	}

	function CreateAccount() {
		let errors = false;
		let errLabel = document.getElementById("email-error");
		let emailInput = document.getElementById("email-input");
		errLabel.innerHTML = "&#8203;";
		errLabel.style.display = "none";

		if (emailInput.value.length == 0) {
			errLabel.innerHTML = "No email entered";
			errors = true;
			errLabel.style.display = "block";
		} else if (emailInput.value.search(/.+@\S+\.\S+/) == -1) {
			errLabel.innerHTML = "Invalid email format entered";
			errors = true;
			errLabel.style.display = "block";
		}

		errLabel = document.getElementById("password-error");
		errLabel.style.display = "none";
		errLabel.innerHTML = "&#8203;";
		if (document.getElementById("password-input").value.length == 0) {
			errLabel.innerHTML = "No password entered";
			errors = true;
			errLabel.style.display = "block";
		} else if (document.getElementById("password-input").value.length < 8) {
			let errerrLabel = document.getElementById("password-error");
			errerrLabel.innerHTML = "Password needs to be 8 characters or more in length";
			errors = true;
			errLabel.style.display = "block";
		}

		errLabel = document.getElementById("error-message");
		errLabel.innerHTML = "&#8203;";
		if (!errors) {
			generatePBKDF(getInputValue("#email-input"), getInputValue("#password-input")).then((derivedPassword) => {
				const data = {
					email: getInputValue("#email-input"),
					password: derivedPassword,
				};
				sendAjaxPost(data, "/account/create", (response) => {
					const reponseData = JSON.parse(response);
					if (!reponseData.success) {
						errLabel.innerHTML = "Error creating account";
					} else {
						location.reload();
					}
				});
			});
		}
	}

	let loginBtn = document.getElementById("login-btn");
	let createAccountBtn = document.getElementById("create-account-btn");
	let passwordInput = document.getElementById("password-input");

	loginBtn.onclick = submitLogin;
	createAccountBtn.onclick = CreateAccount;
	passwordInput.onkeyup = (ev) => {
		if (ev.key === "Enter") {
			submitLogin();
		}
	};
});
