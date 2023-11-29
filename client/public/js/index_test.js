$("#signupSubmit").click(() => {
	const data = { email: $("#emailInput").val(), password: $("#passwordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/create",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#loginSubmit").click(() => {
	const data = { email: $("#emailInput").val(), password: $("#passwordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/login",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#forgotPassword").click(() => {
	const data = { email: $("#emailInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/forgotPassword",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#resetPasswordBtn").click(() => {
	const data = { newPassword: $("#resetPasswordInput").val() };
	$.ajax({
		type: "POST",
		url: `/account/resetPassword?token=${$("#resetTokenInput").val()}`,
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#logOutBtn").click(() => {
	const data = {};
	$.ajax({
		type: "POST",
		url: "/account/logout",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#getData").click(() => {
	const data = {};
	$.ajax({
		type: "GET",
		url: "/account/data",
		data: data,
		success: updateStatus,
	});
});

$("#getVerification").click(() => {
	const data = {};
	$.ajax({
		type: "GET",
		url: "/account/resendVerify",
		data: data,
		success: updateStatus,
	});
});

$("#updateEmail").click(() => {
	const data = { newEmail: $("#newEmailInput").val(), password: $("#passwordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/update-email",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#updatepasswordBtn").click(() => {
	const data = { newPassword: $("#newPasswordInput").val(), password: $("#passwordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/update-password",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#deleteAccountBtn").click(() => {
	const data = { password: $("#passwordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/delete",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#getCharactersBtn").click(() => {
	$(`#characterList`).empty();
	const characterRow = `
	<div class="flex-container">
		<div class="flex-items">
			<p>Character Name</p>
		</div>
		<div class="flex-items">
			<p>Actions</p>
		</div>
	</div>`;

	$("#characterList").append(characterRow);
	$.ajax({
		type: "GET",
		url: "/character/list",
		data: {},
		success: updateCharacterList,
		dataType: "json",
	});
});

$("#newCharacter").click(() => {
	const data = { charaName: $("#newCharacterInput").val() };
	$.ajax({
		type: "POST",
		url: "/character/create",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

function updateStatus(response) {
	$("#statusMessage").empty();
	console.log("Response data:", response);
	if (Array.isArray(response.data)) {
		response.data.forEach((element) => {
			$("#statusMessage").append(`<li>${JSON.stringify(element)}</li>`);
		});
	} else {
		$("#statusMessage").append(`<li>${response.type}</li>`);
		$("#statusMessage").append(`<li>${response.msg}</li>`);
		$("#statusMessage").append(`<li>Data:<ul id="respDataList">`);
		for (const item in response.data) {
			$("#respDataList").append(`<li>${item}: ${response.data[item]}</li>`);
		}
		$("#statusMessage").append(`</ul></li>`);
	}
}

function updateCharacterList(response) {
	response.data.forEach((element) => {
		const characterRow = `
			<div class="flex-container">
				<div class="flex-items">
					<p>${element.charaName}</p>
				</div>
				<div class="flex-items">
					<p><button id="delete${element.charaName}">Delete</button></p>
				</div>
			</div>`;

		$("#characterList").append(characterRow);
		$(`#delete${element.charaName}`).click(() => {
			$.ajax({
				type: "POST",
				url: "/character/delete",
				data: { charaName: element.charaName },
				success: updateStatus,
				dataType: "json",
			});
		});
	});
	updateStatus(response);
}
