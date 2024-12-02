"use strict";

document.addEventListener("DOMContentLoaded", function (arg) {
	let profileData = {
		html: "",
		css: "",
	};

	function populateInputs(response) {
		profileData.html = response.data.profileHtml || "";
		profileData.css = response.data.profileCss || "";
		tinymce.init({
			selector: "#editor",
			license_key: "gpl",
			height: "100%",
			width: 770,
			content_css: ["/css/character/profile-iframe-common.css"],
			plugins: [
				"advlist",
				"autolink",
				"lists",
				"link",
				"image",
				"charmap",
				"preview",
				"anchor",
				"searchreplace",
				"visualblocks",
				"code",
				"fullscreen",
				"insertdatetime",
				"media",
				"table",
				"help",
				"wordcount",
			],
			toolbar:
				"undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview ",
			content_style: profileData.css || "body { font-family:Helvetica,Arial,sans-serif; font-size:16px; }",
			init_instance_callback: (editor) => {
				editor.setContent(profileData.html);
			},
		});
	}

	function handleSubmission(response) {
		if (response.data.success) {
			let characterName = location.search;
			characterName = characterName.substring(characterName.search("=") + 1);
			window.location = `/character/profile?name=${characterName}`;
		}
	}

	let characterName = location.search;
	characterName = characterName.substring(characterName.search("=") + 1);
	sendAjaxGet(`/character/profile-data?name=${characterName}`, populateInputs);

	let submitButton = document.getElementById("submit-editor-btn");
	submitButton.onclick = () => {
		tinyMCE.triggerSave();
		profileData.html = tinymce.get("editor").getContent();

		const editorIfr = document.getElementById("editor_ifr");
		const editorContent = editorIfr.contentDocument || editorIfr.contentWindow.document;
		profileData.css = editorContent.querySelectorAll("style")[1].textContent;

		let characterName = location.search;
		characterName = characterName.substring(characterName.search("=") + 1);
		profileData.name = characterName;
		sendAjaxPost(profileData, "/character/update-profile", handleSubmission);
	};
});
