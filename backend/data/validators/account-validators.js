const { check, query } = require("express-validator");

exports.createEmail = check("email")
	.notEmpty()
	.withMessage("No email address entered")
	.escape()
	.normalizeEmail()
	.isEmail()
	.withMessage("Invalid email address format");

exports.email = check("email")
	.notEmpty()
	.withMessage("No email address entered")
	.normalizeEmail()
	.isEmail()
	.withMessage("Invalid email address format");

exports.passwordEntry = check("password", "No password entered").notEmpty();

exports.newPassword = check("password", "Password must be at least 8 characters in length")
	.notEmpty()
	.isLength({
		min: 8,
	});

exports.tokenQuery = query("token").notEmpty();

exports.accountIDQuery = query("accountID").notEmpty();
