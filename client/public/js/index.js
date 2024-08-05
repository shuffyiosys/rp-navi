"use strict";

document.addEventListener("DOMContentLoaded", (arg) => {
	let loginBtn = document.getElementById("login-btn");
	let logoutBtn = document.getElementById("logout-btn");

	if (loginBtn !== null) {
		loginBtn.onclick = submitLogin;
	}

	if (logoutBtn !== null) {
		logoutBtn.onclick = () => {
			sendAjaxPost({}, "/account/logout", () => {
				location.reload();
			});
		};
	}

	function submitLogin() {
		let errors = false;
		let label = document.getElementById("email-error");
		label.innerHTML = "";
		if (document.getElementById("email-input").value.length == 0) {
			label.innerHTML = "No email entered";
			errors = true;
		}

		label = document.getElementById("password-error");
		label.innerHTML = "";
		if (document.getElementById("password-input").value.length == 0) {
			let label = document.getElementById("password-error");
			label.innerHTML = "No password entered";
			errors = true;
		}

		if (!errors) {
			const data = {
				email: getInputValue("#email-input"),
				password: getInputValue("#password-input"),
			};
			sendAjaxPost(data, "/account/login", (response) => {
				let label = document.getElementById("error-message");
				label.innerHTML = "";
				if (response.type == "error") {
					label.innerHTML = "Error logging in";
				} else {
					location.reload();
				}
			});
		}
	}
});
