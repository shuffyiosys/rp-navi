"use strict";

document.addEventListener("DOMContentLoaded", (arg) => {
	function submitResponse(response) {
		if (response.type == "error") {
			updateStatusMessage(response.data[0].msg, true);
		} else {
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
		if (document.getElementById("email-input").value.length == 0) {
			updateStatusMessage("No email entered", true);
		} else {
			let data = {
				email: document.getElementById("email-input").value,
			};
			sendAjaxPost(data, "/account/forgot-password", submitResponse);
		}
	};
});
