/**
 * @file controllers/account-controller.js
 * @brief Handles the input requests and outgoing responses for account related functionality
 */
const config = require("../config/config")();
const { format } = require("winston");
const service = require("../services/account-service");
const { logger, formatJson } = require("../utils/logger");
const { validationResult } = require("express-validator/check");

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
	logger.debug(req.session.userId);
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
	if ("session" in req === false) {
		res.status(200);
		return;
	}

	req.session.destroy((err) => {
		if (err) {
			logger.error(err);
		}
		res.status(200);
	});
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function loginAccount(req, res) {
	const errors = validationResult(req);
	logger.debug(formatJson(req.session));
	if (errors.isEmpty() === false) {
		res.json(errors.array());
		return;
	} else if ("userId" in req.session && req.session.userId) {
		res.json({ type: "error", msg: "User is already logged in" });
		return;
	}

	const body = req.body;
	const accountData = await service.authenticateUser(body.username, body.password);
	if (accountData !== null) {
		createSession(req, res, accountData.id);
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
	const body = req.body;
	if (!body.username || !body.password || !body.newEmail) {
		res.send(`${req.originalUrl}: Missing a parameter 
			${formatJson({
				username: username in body,
				password: password in body,
				newEmail: newEmail in body,
			})}`);
	} else {
		const accountData = await service.authenticateUser(body.username, body.password);
		if (accountData !== null) {
			const updateData = await service.updateEmail(accountData._id, body.newEmail);
			res.json(updateData);
		} else {
			res.json({ modifiedCount: 0 });
		}
	}
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function updatePassword(req, res) {
	const body = req.body;
	if (!body.username || !body.password || !body.newPassword) {
		res.send(`[${req.originalUrl}] Missing a parameter 
			${formatJson({
				username: username in body,
				password: password in body,
				newPassword: newPassword in body,
			})}`);
	} else {
		const accountData = await service.authenticateUser(body.username, body.password);
		if (accountData !== null) {
			const updateData = await service.updatePassword(accountData._id, body.newPassword);
			res.json(updateData);
		} else {
			res.json({ modifiedCount: 0 });
		}
	}
}

/**
 *
 * @param {*} req
 * @param {*} res
 */
async function deleteAccount(req, res) {
	const body = req.body;
	if (!req.session.userId || !body.password) {
		res.send(`[${req.originalUrl}]: Missing a parameter ${formatJson(body)}`);
	} else {
		const accountData = await service.authenticateUser(body.username, body.password);
		if (accountData !== null) {
			const updateData = await service.deleteAccount(accountData._id);
			res.json(updateData);
		}
	}
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
