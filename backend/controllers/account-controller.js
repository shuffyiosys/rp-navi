/**
 * @file controllers/account-controller.js
 * @brief Handles the input requests and outgoing responses for account related functionality
 */
const config = require("../config/config")();
const accountService = require("../services/account-service");
const verifyService = require("../services/verify-token-service");
const mailer = require("../utils/mailer");
const { logger, formatJson } = require("../utils/logger");
const { validationResult } = require("express-validator");
const { AjaxResponse } = require("../classes/ajax-response");

const { VERIFY_ACTION } = require("../data/verify-token-data");
const { response } = require("express");

/**
 * @brief Creates a session to mark the user has logged in.
 *
 * If there's already a session, this function returns immediately as doing this again seems to
 * clobber any existing session.
 */
function createSession(req, res, accountId) {
	req.session.userId = accountId;
	req.session.save();
	logger.debug(`[createSession] ${req.session.userId}`);
}

/**
 * @brief Destroys the session
 * @param {*} req Request data from client
 * @param {*} res Response object to client
 */
function destroySession(req, res) {
	req.session.destroy((err) => {
		if (err) {
			logger.error(err);
		}
		res.status(200);
	});
}

/**
 * @brief Checks for commonly expected errors
 * @param {*} req Request data from client
 * @param {*} res Response object to client
 * @returns True if there are errors, false otherwise
 */
function hasCommonReqErrors(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(new AjaxResponse("error", "Errors with input", { errors: errors.array() }));
		return true;
	} else if ("userId" in req.session === false) {
		res.json(new AjaxResponse("error", "Not logged in", {}));
		return true;
	}
	return false;
}

/**
 * Handles creating an account requests
 * @param {*} req Request data from client
 * @param {*} res Response object to client
 *
 * CLIENT -> POST request containing an email and passowrd
 * SERVER <- On error: Either what's missing (failed verification) or the account exists
 *           On Success: Create a session ~~and redirect~~
 */
async function createAccount(req, res) {
	const errors = validationResult(req);
	const body = req.body;

	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	} else if (await accountService.accountExists(body.email)) {
		res.json({
			type: "error",
			msg: "An account with this email address exists",
		});
		logger.info(`${body.email} was being used to create another account`);
		return;
	}

	const accountData = await accountService.createAccount(body.email, body.password);
	if (accountData !== null) {
		createSession(req, res, accountData.id);
		const tokenData = await verifyService.generateToken(VERIFY_ACTION.VERIFY_EMAIL, accountData.id);

		// Send verification mail based on environment.
		// If prod, send actual mail, if development, send a test mail over ethereal
		if (config.environment === "production") {
			// Send mail here
		} else if (config.environment === "development") {
			mailer.sendVerifyMail(body.email, body.email, tokenData.token);
		}
		res.json(new AjaxResponse("info", "Account created", {}));
	} else {
		res.json(new AjaxResponse("error", "Error creating an account", {}));
	}
}

/**
 *
 * @param {*} req Request data from client
 * @param {*} res Response object to client
 */
async function getAccountData(req, res) {
	if ("userId" in req.session === false) {
		res.json({ type: "error", msg: "Not logged in" });
		return;
	}

	const accountData = await accountService.getAccountData(req.session.userId);
	res.json(new AjaxResponse("info", "", accountData));
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function logoutAccount(req, res) {
	destroySession(req, res);
	res.json(new AjaxResponse("info", "Logged out"));
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function loginAccount(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return true;
	} else if ("userId" in req.session === true) {
		res.json(new AjaxResponse("error", "Already logged in", {}));
		return true;
	}

	const body = req.body;
	const accountData = await accountService.authenticateUser(body.password, body.email, null);
	if (accountData) {
		createSession(req, res, accountData.id.toString());
		res.json(new AjaxResponse("info", "Login successful", {}));
	} else {
		res.json(new AjaxResponse("error", "Login error", {}));
	}
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function updateEmail(req, res) {
	const body = req.body;
	if (hasCommonReqErrors(req, res) === true) {
		return;
	} else if (await accountService.accountExists(body.newEmail)) {
		res.json({
			type: "error",
			msg: "An account with this email address exists",
		});
		logger.info(`${body.email} was being used to create another account`);
		return;
	}
	const accountData = await accountService.authenticateUser(body.password, null, req.session.userId);
	let response = new AjaxResponse("info", "Email not updated", {
		modifiedCount: 0,
	});
	if (accountData) {
		const updateData = await accountService.updateEmail(req.session.userId, body.newEmail);
		response.data = updateData;
		response.msg = JSON.stringify(updateData);
		res.json(response);
	} else {
		res.json(response);
	}
}

/** Passowrd management handlers ******************************************* */
/**
 *
 * @param {*} req
 * @param {*} res
 */
async function updatePassword(req, res) {
	if (hasCommonReqErrors(req, res) === true) {
		return;
	}

	const body = req.body;
	const accountData = await accountService.authenticateUser(body.password, null, req.session.userId);
	let response = new AjaxResponse("info", "Password not updated", { modifiedCount: 0 });
	if (accountData !== null) {
		const updateData = await accountService.updatePassword(req.session.userId, body.newPassword);
		response.data = updateData;
		response.msg = JSON.stringify(updateData);
		res.json(response);
	} else {
		res.json(response);
	}
}

async function requestPasswordReset(req, res) {
	const errors = validationResult(req);
	let response = new AjaxResponse(
		"info",
		"If the email address is registered, a password reset mail will be sent to it",
		{}
	);
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	}

	const body = req.body;
	const accountData = await accountService.getAccountData(null, body.email);
	if (accountData === null) {
		res.json(response);
		return;
	}

	const existingToken = await verifyService.getToken(null, VERIFY_ACTION.RESET_PASSWORD, accountData.id.toString());
	if (existingToken) {
		await verifyService.deleteToken(existingToken.token);
	}

	const resetPwToken = await verifyService.generateToken(VERIFY_ACTION.RESET_PASSWORD, accountData.id.toString());
	if (resetPwToken) {
		response = new AjaxResponse(
			"info",
			`Password reset generated at <a href="account/resetPassword?token=${resetPwToken.token}">this link</a>`,
			{
				token: resetPwToken.token,
			}
		);
	}
	res.json(response);
}

async function verifyPasswordReset(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.redirect("/");
	}

	const resetToken = await verifyService.getToken(req.query.token, VERIFY_ACTION.RESET_PASSWORD);
	if (resetToken) {
		res.json(new AjaxResponse("info", "Password reset link verified", {}));
	} else {
		res.json(new AjaxResponse("error", "Password reset expired", {}));
	}
}

async function updatePasswordReset(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	}

	/** Make sure the reset token still exists, since it should expire */
	const resetToken = await verifyService.getToken(req.query.token, VERIFY_ACTION.RESET_PASSWORD);
	if (!resetToken) {
		res.json(new AjaxResponse("error", "Password reset request expired", {}));
		return;
	}
	await verifyService.deleteToken(req.query.token);
	const accountData = await accountService.getAccountData(resetToken.referenceId);
	let response = new AjaxResponse("error", "Error with handling password reset", {});
	if (accountData) {
		const updateData = await accountService.updatePassword(resetToken.referenceId, req.body.newPassword);
		response.type = "info";
		response.msg = "Password update information";
		response.data = updateData;
		res.json(response);
	} else {
		res.json(response);
	}
}

/** Verification handlers ****************************************************/

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function verifyAccount(req, res) {
	if (hasCommonReqErrors(req, res) === true) {
		return;
	}

	let response = new AjaxResponse("error", "Could not verify email", { verified: false });
	const emailedVerified = await verifyService.verifyRequest(
		req.query.token,
		VERIFY_ACTION.VERIFY_EMAIL,
		req.session.userId
	);
	if (emailedVerified == true) {
		const updateData = await accountService.updateVerification(req.session.userId, true);
		response = new AjaxResponse("info", "E-mail verified", updateData);
	}
	res.json(response);
}

async function resendVerification(req, res) {
	if (hasCommonReqErrors(req, res) === true) {
		return;
	}
	await verifyService.deleteToken(undefined, VERIFY_ACTION.VERIFY_EMAIL, req.session.userId);
	const newTokenData = await verifyService.generateToken(VERIFY_ACTION.VERIFY_EMAIL, req.session.userId);
	let response = new AjaxResponse("Error", "No verification token found", {});
	if (newTokenData) {
		response = new AjaxResponse(
			"info",
			`New email verification sent: <a href="account/verify?token=${newTokenData.token}">this link</a>`,
			{ token: newTokenData.token }
		);
	}
	res.json(response);
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function deleteAccount(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	} else if ("userId" in req.session === false) {
		res.json({ type: "error", msg: "Not logged in" });
		return;
	}

	const body = req.body;
	const accountData = await accountService.authenticateUser(body.password, null, req.session.userId);
	let response = new AjaxResponse("info", "", { deletedCount: 0 });
	if (accountData) {
		const updateData = await accountService.deleteAccount(req.session.userId);
		response.data = updateData;
		response.msg = JSON.stringify(updateData);
		res.json(response);
		destroySession(req, res);
	} else {
		res.json(response);
	}
}

module.exports = {
	createAccount,
	getAccountData,
	logoutAccount,
	loginAccount,

	updateEmail,

	updatePassword,
	requestPasswordReset,
	verifyPasswordReset,
	updatePasswordReset,

	verifyAccount,
	resendVerification,

	deleteAccount,
};
