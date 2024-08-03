let initEditor = function () {
	tinymce.init({
		selector: "#editor",
		license_key: "gpl",
		height: 500,
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
			"undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
		content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
		content_css: ["./css/common.css"],
		init_instance_callback: () => {
			console.log("Loading editor...");
			// Hook up CSS and JS editors on here
			const editorIfr = document.getElementById("editor_ifr");
			const editorContent = editorIfr.contentDocument || editorIfr.contentWindow.document;
			const editorHead = editorContent.querySelector("head");

			// Insert user CSS area
			editorHead.insertAdjacentHTML("beforeend", `<style id="user-css"></style>`);
			const cssStyle = editorContent.querySelector("style#user-css");

			const editorCssInput = document.getElementById("editor-css");
			cssStyle.innerText = editorCssInput.value;
			editorCssInput.onchange = () => {
				cssStyle.innerText = editorCssInput.value;
			};

			// Insert user JS area
			editorHead.insertAdjacentHTML("beforeend", `<script type="text/javascript"></script>`);
			const jsSource = editorContent.querySelector("script");
			const editorJsInput = document.getElementById("editor-js");
			jsSource.text = editorJsInput.value;
		},
	});
};

document.addEventListener("DOMContentLoaded", function (arg) {
	initEditor();
	let reloadBtn = document.getElementById("reload-editor-btn");
	reloadBtn.onclick = () => {
		tinymce.remove();
		initEditor();
	};

	let submitButton = document.getElementById("submit-editor-btn");
	submitButton.onclick = () => {
		tinyMCE.triggerSave();
		let htmlSource = document.getElementById("question_html");
		htmlSource.value = tinymce.get("editor").getContent();

		const data = {
			html: htmlSource.value,
			css: document.getElementById("editor-css").value,
			js: document.getElementById("editor-js").value,
		};
		sendAjaxPost(data, "/editor-submit");
	};
});

function sendAjaxPost(data, url, callback = updateStatus) {
	let postData = JSON.stringify(data);
	let xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onload = function () {
		if (xhr.status == 200) {
			callback(JSON.parse(this.response));
		}
	};

	xhr.send(postData);
}

function updateStatus(response) {
	console.log(response);
}
