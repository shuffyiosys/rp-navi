"use strict";

document.addEventListener("DOMContentLoaded", (arg) => {
	function submitLogin() {
		let errors = false;
		let label = document.getElementById("email-error");
		label.innerHTML = "&#8203;";
		if (document.getElementById("email-input").value.length == 0) {
			label.innerHTML = "No email entered";
			errors = true;
		}

		label = document.getElementById("password-error");
		label.innerHTML = "&#8203;";
		if (document.getElementById("password-input").value.length == 0) {
			let label = document.getElementById("password-error");
			label.innerHTML = "No password entered";
			errors = true;
		}

		label = document.getElementById("error-message");
		label.innerHTML = "&#8203;";
		if (!errors) {
			const data = {
				email: getInputValue("#email-input"),
				password: getInputValue("#password-input"),
			};
			sendAjaxPost(data, "/account/login", (response) => {
				if (response.type == "error") {
					label.innerHTML = "Error logging in";
				} else {
					location.reload();
				}
			});
		}
	}

	function createAccount() {
		let errors = false;
		let label = document.getElementById("email-error");
		let emailInput = document.getElementById("email-input");
		label.innerHTML = "&#8203;";
		if (emailInput.value.length == 0) {
			label.innerHTML = "No email entered";
			errors = true;
		} else if (emailInput.value.search(/.+@\S+\.\S+/) == -1) {
			label.innerHTML = "Invalid email format entered";
			errors = true;
		}

		label = document.getElementById("password-error");
		label.innerHTML = "&#8203;";
		if (document.getElementById("password-input").value.length == 0) {
			let errlabel = document.getElementById("password-error");
			errlabel.innerHTML = "No password entered";
			errors = true;
		} else if (document.getElementById("password-input").value.length < 8) {
			let errlabel = document.getElementById("password-error");
			errlabel.innerHTML = "Password needs to be 8 characters or more in length";
			errors = true;
		}

		label = document.getElementById("error-message");
		label.innerHTML = "&#8203;";
		if (!errors) {
			const data = {
				email: getInputValue("#email-input"),
				password: getInputValue("#password-input"),
			};
			sendAjaxPost(data, "/account/create", (response) => {
				if (response.type == "error") {
					label.innerHTML = "Error logging in";
				} else {
					location.reload();
				}
			});
		}
	}

	let loginBtn = document.getElementById("login-btn");
	let createAccountBtn = document.getElementById("create-account-btn");

	loginBtn.onclick = submitLogin;
	createAccountBtn.onclick = createAccount;
});
