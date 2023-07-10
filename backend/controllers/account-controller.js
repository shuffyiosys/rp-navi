/**
 * @file controllers/account-controller.js
 * @brief Handles the input requests and outgoing responses for account related functionality
 */
const config = require("../config/config")();
const service = require("../services/account-service");
const { logger, formatJson } = require("../utils/logger");
const { validationResult } = require("express-validator/check");
const { AjaxResponse } = require("../classes/ajax-response");
const { format } = require("winston");

/**
 * @brief Creates a session to mark the user has logged in.
 *
 * If there's already a session, this function returns immediately as doing this
 * again seems to clobber any existing session.
 */
function createSession(req, res, accountId) {
	res.cookie(config.session.name, "value", { account: accountId });
	req.session.userId = accountId;
	req.session.save();
	logger.debug(`[createSession] ${req.session.userId}`);
}

function destroySession(req, res) {
	req.session.destroy((err) => {
		if (err) {
			logger.error(err);
		}
		res.status(200);
	});
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

	logger.debug(formatJson(body));

	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	} else if (await service.accountExists(body.email)) {
		res.json({ type: "error", msg: "An account with this email address exists" });
		logger.info(`${body.email} was being used to create another account`);
		return;
	}

	const accountData = await service.createAccount(body.email, body.password);
	if (accountData !== null) {
		createSession(req, res, accountData.id);
		res.json(accountData);
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

	const accountData = await service.getAccountData(req.session.userId);
	logger.debug(formatJson(accountData));
	res.json(accountData);
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function logoutAccount(req, res) {
	destroySession(req, res);
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
		return;
	} else if ("userId" in req.session) {
		res.json({ msg: "Already logged in" });
		return;
	}
	const body = req.body;
	const accountData = await service.authenticateUser(body.email, body.password);
	if (accountData.success === true) {
		createSession(req, res, accountData.accountId);
		res.json({ msg: "Login successful" });
	} else {
		res.json({ msg: "Login error" });
	}
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function updateEmail(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	} else if ("userId" in req.session === false) {
		res.json({ type: "error", msg: "Not logged in" });
		return;
	}

	const body = req.body;
	const accountData = await service.autheticateBySession(req.session.userId, body.password);
	let response = new AjaxResponse("info", "Email not updated", { modifiedCount: 0 });
	if (accountData !== null) {
		const updateData = await service.updateEmail(req.session.userId, body.newEmail);
		response.data = updateData;
		response.msg = JSON.stringify(updateData);
		res.json(response);
	} else {
		res.json(response);
	}
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function updatePassword(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	} else if ("userId" in req.session === false) {
		res.json({ type: "error", msg: "Not logged in" });
		return;
	}

	const body = req.body;
	const accountData = await service.autheticateBySession(req.session.userId, body.password);
	let response = new AjaxResponse("info", "Password not updated", { modifiedCount: 0 });
	if (accountData !== null) {
		const updateData = await service.updatePassword(req.session.userId, body.newPassword);
		response.data = updateData;
		response.msg = JSON.stringify(updateData);
		res.json(response);
	} else {
		res.json(response);
	}
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
	const accountData = await service.autheticateBySession(req.session.userId, body.password);
	let response = new AjaxResponse("info", "", { deletedCount: 0 });
	if (accountData !== null) {
		const updateData = await service.deleteAccount(req.session.userId);
		response.data = updateData;
		response.msg = JSON.stringify(updateData);
		res.json(response);
	} else {
		res.json(response);
	}
	destroySession(req, res);
}

module.exports = {
	createAccount,
	getAccountData,
	logoutAccount,
	loginAccount,
	updateEmail,
	updatePassword,
	deleteAccount,
};
