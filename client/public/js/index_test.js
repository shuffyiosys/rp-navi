$("#signupSubmit").click(() => {
	const data = { email: $("#signupEmail").val(), password: $("#signupPassword").val() };
	$.ajax({
		type: "POST",
		url: "/account/create",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#loginSubmit").click(() => {
	const data = { email: $("#signupEmail").val(), password: $("#signupPassword").val() };
	$.ajax({
		type: "POST",
		url: "/account/login",
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
	const data = { email: $("#signupEmail").val(), password: $("#signupPassword").val() };
	$.ajax({
		type: "GET",
		url: "/account/data",
		data: data,
		success: updateStatus,
	});
});

$("#updateEmail").click(() => {
	const data = { newEmail: $("#newEmailInput").val(), password: $("#currentPasswordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/update-email",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#updatepasswordBtn").click(() => {
	const data = { newPassword: $("#newPasswordInput").val(), password: $("#currentPasswordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/update-password",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

$("#deleteAccountBtn").click(() => {
	const data = { password: $("#currentPasswordInput").val() };
	$.ajax({
		type: "POST",
		url: "/account/delete",
		data: data,
		success: updateStatus,
		dataType: "json",
	});
});

function updateStatus(data) {
	$("#statusMessage").empty();
	if ("msg" in data) {
		$("#statusMessage").append(`<li>${data.msg}</li>`);
	} else if (Array.isArray(data)) {
		data.forEach((element) => {
			$("#statusMessage").append(`<li>${element.msg}</li>`);
		});
	} else {
		for (const item in data) {
			$("#statusMessage").append(`<li>${item}: ${data[item]}</li>`);
		}
	}
}
