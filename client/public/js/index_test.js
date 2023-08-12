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

function updateStatus(data) {
	$("#statusMessage").empty();
	console.log("Response data:", data);
	if (Array.isArray(data)) {
		data.forEach((element) => {
			$("#statusMessage").append(`<li>${element.msg}</li>`);
		});
	} else {
		$("#statusMessage").append(`<li>${data.type}</li>`);
		$("#statusMessage").append(`<li>${data.msg}</li>`);
		$("#statusMessage").append(`<li>Data:<ul id="respDataList">`);
		for (const item in data.data) {
			$("#respDataList").append(`<li>${item}: ${data.data[item]}</li>`);
		}
		$("#statusMessage").append(`</ul></li>`);
	}
}
