document.addEventListener("DOMContentLoaded", function (arg) {
	let characterName = location.search;
	characterName = characterName.substring(characterName.search("=") + 1);
	sendAjaxGet(`/character/profile-data?name=${characterName}`, renderProfile);

	function renderProfile(response) {
		const previewIfr = document.getElementById("profile-iframe");
		const previewContent = previewIfr.contentDocument || previewIfr.contentWindow.document;
		previewIfr.src = "about:blank";
		let includeJquery = "";

		if (response.data.includeJquery) {
			includeJquery = `<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>`;
		}

		const htmlDoc = `
				<!DOCTYPE html>
				<html>
					<head>
						<link rel="stylesheet" href="/css/character/profile-iframe-common.css">
						<style id="user-css"></style>
						${includeJquery}
						<script id="user-js"></script>
					</head>
					<body>
						<div id="profile-container">
							${response.data.profileHtml}
						</div>
					</body>
				</html>
			`;

		previewContent.open();
		previewContent.write(htmlDoc);
		previewContent.close();

		const cssStyle = previewContent.querySelector("style#user-css");
		cssStyle.textContent = response.data.profileCss;
		previewIfr.addEventListener("load", () => {
			const jsSource = previewContent.querySelector("script#user-js");
			jsSource.textContent = response.data.profileJs;
		});
	}
});
