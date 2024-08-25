"use strict";

document.addEventListener("DOMContentLoaded", (arg) => {
	function submitResponse(response) {
		console.log(response);
		if (response.type == "error") {
			updateStatusMessage(response.data[0].msg, true);
		} else {
			console.log(response);
			updateStatusMessage("Request processed!");
		}
	}

	function updateStatusMessage(message, error = false) {
		let label = document.getElementById("status-label");
		label.innerHTML = message;
		if (error) {
			label.classList.add("error-label");
		} else {
			label.classList.remove("error-label");
		}
	}

	let submitBtn = document.getElementById("submit-btn");
	submitBtn.onclick = () => {
		if (document.getElementById("new-password-input").value.length == 0) {
			updateStatusMessage("No password entered", true);
		} else if (document.getElementById("new-password-input").value.length < 8) {
			updateStatusMessage("Password must be 8 characters or more in length", true);
		} else {
			let data = {
				newPassword: document.getElementById("new-password-input").value,
			};
			sendAjaxPost(data, "/account/reset-password", submitResponse);
		}
	};
});
