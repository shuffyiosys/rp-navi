/**
 * @file controllers/account-controller.js
 * @brief Handles the input requests and outgoing responses for account related functionality
 */
const { validationResult } = require(`express-validator`);
const accountService = require(`../services/mongodb/account-service`);
const verifyService = require(`../services/mongodb/verify-token-service`);
const mailer = require(`../utils/mailer`);
const { logger, formatJson } = require(`../utils/logger`);
const { AjaxResponse } = require(`../classes/ajax-response`);
const { PageRenderParams } = require(`../classes/page-render-params`);
const { AUTHENTICATION_RESULT, ACCOUNT_STATE } = require(`../data/account-data`);

/**
 * Handles creating an account requests
 *
 * CLIENT -> POST request containing an email and passowrd
 * SERVER <- On error: Either what's missing (failed verification) or the account exists
 *           On Success: Create a session ~~and redirect~~
 */
async function CreateAccount(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Errors with input`, errors.array()));
		return;
	} else if (await accountService.GetAccountExists(req.body.email)) {
		const ip = (req.headers["x-forwarded-for"] || req.connection.remoteAddress || "")
			.split(",")[0]
			.trim();
		logger.info(`${ip} tried creating an account with already used email ${req.body.email} `);
		res.json({
			type: `error`,
			msg: `An account with this email address exists`,
		});
		return;
	}

	const accountData = await accountService.CreateAccount(req.body.email, req.body.password);
	if (accountData !== null) {
		req.session.userID = accountData.id.toString();
		req.session.save();
		mailer.sendVerifyMail(req.body.email, req.body.email, accountData.emailVerifyKey);
		res.json(new AjaxResponse(true, `Account created`, {}));
	} else {
		res.json(new AjaxResponse(false, `Error creating an account`, {}));
	}
}

async function GetAccountPage(req, res) {
	if (!(`userID` in req.session)) {
		res.redirect(`/`);
	} else {
		const accountData = await accountService.GetAccountDataByID(req.session.userID);
		const pageData = new PageRenderParams(
			`Account page for ${accountData.email}`,
			accountData,
			res.locals
		);
		res.render(`account/index`, pageData);
	}
}

async function GetAccountData(req, res) {
	if (!(`userID` in req.session)) {
		res.json(new AjaxResponse(false, `Not logged in`, {}));
		return;
	}

	const accountData = await accountService.GetAccountDataByID(req.session.userID);
	res.json(new AjaxResponse(true, ``, accountData));
}

async function LogoutAccount(req, res) {
	console.log(req);
	req.session.destroy((err) => {
		if (err) {
			logger.error(err);
		}
	});

	if ("noRedirect" in req.body) {
		res.json(new AjaxResponse(true, ``, {}));
		return;
	} else {
		const pageData = new PageRenderParams("Home", { loggedIn: false }, res.locals);
		res.render("index", pageData);
	}
}

async function LoginAccount(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Errors with input`, errors.array()));
		return;
	} else if (`userID` in req.session) {
		res.json(new AjaxResponse(false, `Already logged in`, {}));
		return;
	}

	const response = await accountService.AuthenticateUser(req.body.password, req.body.email, "email");
	logger.debug(`User ${req.body.email} is logging in, result ${formatJson(response)}`);
	if (response.status === AUTHENTICATION_RESULT.BANNED) {
		res.json(new AjaxResponse(false, `User is banned`, {}));
	} else if (response.status === AUTHENTICATION_RESULT.GENERAL_ERROR) {
		res.json(new AjaxResponse(false, `Error with logging in`, {}));
	} else if (response.status === AUTHENTICATION_RESULT.SUCCESS) {
		req.session.userID = response.id.toString();
		req.session.save();
		res.json(new AjaxResponse(true, ``, {}));
	} else if (response.status === AUTHENTICATION_RESULT.NEED_NEW_PASSWORD) {
		const pageData = new PageRenderParams(
			`Reset password`,
			{
				canReset: true,
				accountID: response.id.toString(),
			},
			res.locals
		);
		res.render(`account/reset-password`, pageData);
	} else {
		logger.info(`General error with logging in: ${formatJson(response)}`);
		res.json(new AjaxResponse(false, `Error with logging in`, {}));
	}
}

/** Core update handlers ************************************************** */
async function UpdateEmail(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Errors with input`, errors.array()));
		return;
	} else if (!(`userID` in req.session)) {
		res.json(new AjaxResponse(false, `User is not logged in`, errors.array()));
		return;
	}

	const emailInUse = await accountService.GetAccountExists(req.body.newEmail);
	if (emailInUse) {
		res.json(new AjaxResponse(false, `This email is already in use`, errors.array()));
		return;
	}

	const response = await accountService.AuthenticateUser(req.body.password, req.session.usrID, "ID");
	if (response.status === AUTHENTICATION_RESULT.SUCCESS) {
		const updateData = await accountService.UpdateEmail(req.session.userID, req.body.newEmail);
		res.json(new AjaxResponse(true, JSON.stringify(updateData), updateData));
	} else {
		res.json(new AjaxResponse(false, `Email not updated`));
	}
}

async function UpdatePassword(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Errors with input`, errors.array()));
		return;
	} else if (!(`userID` in req.session)) {
		res.json(new AjaxResponse(false, `User is not logged in`, errors.array()));
		return;
	}

	const response = await accountService.AuthenticateUser(req.body.password, req.session.userID, "ID");
	if (response.status === AUTHENTICATION_RESULT.SUCCESS) {
		const updateData = await accountService.UpdatePassword(req.session.userID, req.body.newPassword);
		res.json(new AjaxResponse(true, JSON.stringify(updateData), updateData));
	} else {
		res.json(new AjaxResponse(false, `Password not updated`));
	}
}

/** Passowrd reset handlers *********************************************** */
async function RequestPasswordReset(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Errors with input`, errors.array()));
		return;
	} else if (`userID` in req.session) {
		res.redirect(`/`);
	}

	const accountData = await accountService.GetAccountDataByEmail(req.body.email);
	if (accountData === null) {
		// If there's no account with the email, stop here and don't mention anything.
		res.json(new AjaxResponse(true, ``, {}));
		return;
	}

	// Might need to investigate later if relying on auto-deleting is good enough
	const resetPwToken = await verifyService.GenerateToken(accountData.id.toString());
	mailer.sendPwResetEmail(req.body.email, req.body.email, resetPwToken.token);
	logger.debug(`Password reset link: /account/reset-password?token=${resetPwToken.token}`);
	res.json(new AjaxResponse(true, ``, {}));
}

async function VerifyPasswordReset(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty() || `userID` in req.session) {
		res.redirect(`/`);
		return;
	}

	const pageData = new PageRenderParams(`Reset password`, { canReset: false }, res.locals);
	if ("token" in req.query) {
		const resetToken = await verifyService.GetToken(req.query.token);
		if (resetToken !== null) {
			pageData.data.token = resetToken;
			pageData.data.canReset = true;
		}
	} else if ("accountID" in req.query) {
		const accountData = await accountService.GetAccountDataByID(req.query.accountID, null, "state");

		if (accountData !== null && accountData.state == ACCOUNT_STATE.NEED_NEW_PASSOWRD) {
			pageData.data.accountID = req.query.accountID;
			pageData.data.canReset = true;
		}
	}
	res.render(`account/reset-password`, pageData);
}

async function UpdatePasswordFromReset(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let response = new AjaxResponse(false, `Error with password input`, errors);
		res.json(response);
		return;
	}

	/** Make sure the reset token still exists, since it should expire */
	const resetToken = await verifyService.GetToken(req.query.token);
	if (resetToken === null) {
		res.json(new AjaxResponse(false, `Password reset request expired`, {}));
		return;
	}

	await verifyService.DeleteToken(req.query.token);
	let response = new AjaxResponse(false, `Error with handling password reset`, {});
	const updateData = await accountService.UpdatePassword(resetToken.referenceID, req.body.newPassword);
	if (updateData.modifiedCount === 1) {
		response.success = true;
		response.msg = `Password updated`;
	}
	res.json(response);
}

/** Verification handlers ****************************************************/
async function VerifyAccount(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, "", errors));
		return;
	}

	const accountData = await accountService.GetAccountDataByID(req.session.userID, "_id emailVerifyKey");
	if (accountData === null) {
		res.json(new AjaxResponse(false, `Could not verify email address`, {}));
		return;
	} else if (accountData.emailVerifyKey === req.query.token) {
		const updateData = await accountService.UpdateVerification(req.session.userID, true);

		if (updateData.modifiedCount === 1) {
			res.json(new AjaxResponse(true, `E-mail verified`, {}));
		} else {
			res.json(new AjaxResponse(false, `E-mail not verified`, {}));
		}
	}
}

async function ResendVerification(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Error with input`, errors));
		return;
	}

	const accountData = await accountService.GetAccountDataByID(req.session.userID, "_id emailVerifyKey");
	if (accountData === null) {
		res.json(new AjaxResponse(false, `Account not found`, {}));
	} else {
		mailer.sendVerifyMail(req.body.email, req.body.email, accountData.emailVerifyKey);
		res.json(
			new AjaxResponse(
				`success`,
				`New email verification sent: <a href="account / verify ? token = ${accountData.emailVerifyKey}">this link</a>`,
				{ token: accountData.emailVerifyKey }
			)
		);
	}
}

/** Delete handler **********************************************************/
async function DeleteAccount(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.json(new AjaxResponse(false, `Error with input`, errors));
		return;
	} else if (!(`userID` in req.session)) {
		res.json({ type: `error`, msg: `Not logged in` });
		return;
	}

	const authResponse = await accountService.AuthenticateUser(req.body.password, req.session.userID, "ID");
	if (authResponse.status === AUTHENTICATION_RESULT.NEED_NEW_PASSWORD) {
		const pageData = new PageRenderParams(
			`Reset password`,
			{
				canReset: true,
				accountID: authResponse.id.toString(),
			},
			res.locals
		);
		res.render(`account/reset-password`, pageData);
		return;
	} else if (authResponse.status !== AUTHENTICATION_RESULT.SUCCESS) {
		res.json(new AjaxResponse(false, `There was a problem, try deleting again`, {}));
	}

	const updateData = await accountService.DeleteAccount(req.session.userID);
	if (updateData.deletedCount === 1) {
		res.json(new AjaxResponse(true, ``, {}));
		req.session.destroy((err) => {
			if (err) {
				logger.error(err);
			}
			res.status(500);
		});
	} else {
		res.json(new AjaxResponse(false, `There was a problem deleting the account`, {}));
	}
}

module.exports = {
	CreateAccount,
	GetAccountPage,
	GetAccountData,
	LogoutAccount,
	LoginAccount,

	UpdateEmail,
	UpdatePassword,
	RequestPasswordReset,
	VerifyPasswordReset,
	UpdatePasswordFromReset,

	VerifyAccount,
	ResendVerification,

	DeleteAccount,
};
