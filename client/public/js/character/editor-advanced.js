document.addEventListener("DOMContentLoaded", function (arg) {
	const previewIfr = document.getElementById("preview-iframe");
	const htmlEditor = document.getElementById("editor-html");
	const editorCssInput = document.getElementById("editor-css");
	const editorJsInput = document.getElementById("editor-js");
	const refreshIfrBtn = document.getElementById("refresh-button");
	const previewContent = previewIfr.contentDocument || previewIfr.contentWindow.document;

	function populateInputs(response) {
		htmlEditor.value = response.data.profileHtml || "";
		editorCssInput.value = response.data.profileCss || "";
		editorJsInput.value = response.data.profileJs || "";
		document.querySelector("#include-jquery-checkbox").checked = response.data.includeJquery;

		htmlEditor.onchange = () => {
			refreshIframe();
		};

		editorCssInput.onchange = () => {
			updateCss();
		};

		editorJsInput.onchange = () => {
			updateJs();
		};

		refreshIframe();
	}

	function refreshIframe() {
		// Hook up CSS and JS editors on here
		previewIfr.src = "about:blank";
		let includeJquery = "";

		if (document.querySelector("#include-jquery-checkbox").checked) {
			includeJquery = `<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>`;
		}

		const htmlEditor = document.getElementById("editor-html");
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
							${htmlEditor.value}
						</div>
					</body>
				</html>
			`;

		previewContent.open();
		previewContent.write(htmlDoc);
		previewContent.close();

		updateCss();
		previewIfr.addEventListener("load", () => {
			updateJs();
		});
	}

	function updateCss() {
		const cssStyle = previewContent.querySelector("style#user-css");
		const editorCssInput = document.getElementById("editor-css");
		cssStyle.textContent = editorCssInput.value;
	}

	function updateJs() {
		const jsSource = previewContent.querySelector("script#user-js");
		const editorJsInput = document.getElementById("editor-js");
		jsSource.textContent = editorJsInput.value;
	}

	function handleSubmission(response) {
		if (response.data.success) {
			let characterName = location.search;
			characterName = characterName.substring(characterName.search("=") + 1);
			window.location = `/character/profile?name=${characterName}`;
		}
	}

	refreshIframe();

	let characterName = location.search;
	characterName = characterName.substring(characterName.search("=") + 1);
	sendAjaxGet(`/character/profile-data?name=${characterName}`, populateInputs);

	refreshIfrBtn.onclick = () => {
		refreshIframe();
	};

	document.getElementById("submit-btn").onclick = () => {
		let characterName = location.search;
		characterName = characterName.substring(characterName.search("=") + 1);

		const data = {
			name: characterName,
			html: htmlEditor.value,
			css: editorCssInput.value,
			js: editorJsInput.value,
			includeJquery: document.querySelector("#include-jquery-checkbox").checked,
		};
		sendAjaxPost(data, "/character/update-profile", handleSubmission);
	};
});
