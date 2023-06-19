/**
 * @file 
 */
const config = require("../config/config")();
const service = require("../services/account-service");
const { validationResult } = require("express-validator/check");

function createSession(req, res, accountId) {
	res.cookie(config.session.name, "value", {
		account: accountId,
	});
	req.session.account = accountId;
	req.session.save();
}

async function createAccount(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		return res.status(422).jsonp(errors.array());
	}

	const accountData = await service.createAccount(body.username, body.password, body.email);
	if (accountData !== null) {
		createSession(req, res, accountData.id);
	}
	res.json(accountData);
}

async function getAccountData(req, res) {
	if (!req.session.account) {
	} else {
		const accountData = await service.getAccountData(req.session.account);
		res.json(accountData);
	}
}

async function logoutAccount(req, res) {
	req.session.destroy((err) => {
		if (err) {
			logger.error(err);
		}
		res.status(200);
	});
}

async function authenticateUser(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		return res.status(422).jsonp(errors.array());
	}
	const body = req.body;
	const accountData = await service.authenticateUser(body.username, body.password);
	if (accountData !== null) {
		createSession(req, res, accountData.id);
	}
}

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

async function deactivateAccount(req, res) {}

async function deleteAccount(req, res) {
	const body = req.body;
	if (!req.session.account || !body.password) {
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
	authenticateUser,
	updateEmail,
	updatePassword,
	deactivateAccount,
	deleteAccount,
};
