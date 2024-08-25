"use strict";

document.addEventListener("DOMContentLoaded", (arg) => {
	let logoutBtn = document.getElementById("logout-btn");

	if (logoutBtn !== null) {
		logoutBtn.onclick = () => {
			sendAjaxPost({}, "/account/logout", () => {
				location.reload();
			});
		};
	}
});
