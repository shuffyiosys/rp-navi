function callbackStub(response) {
	console.log("AJAX response", response);
}

function sendAjaxPost(data, url, callback = callbackStub) {
	let postData = JSON.stringify(data);
	let xhr = new XMLHttpRequest();

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onload = function () {
		if (xhr.status == 200) {
			callback(this.response);
		}
	};

	xhr.send(postData);
}

function sendAjaxGet(url, callback = callbackStub) {
	let xhr = new XMLHttpRequest();

	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.onload = function () {
		if (xhr.status == 200) {
			callback(JSON.parse(this.response));
		}
	};

	xhr.send();
}

function getInputValue(query) {
	return document.querySelector(query).value;
}
