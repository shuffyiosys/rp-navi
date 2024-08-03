/**
 * Handles all Account based data manipulation and interfaces with the database.
 */
const { PERMISSION_LEVELS } = require(`../../data/account-data`);
const { logger, formatJson } = require(`../../utils/logger`);
const { MODEL_NAMES } = require(`../../models/model-names`);
const crypto = require(`../../utils/crypto`);

const mongoose = require(`mongoose`);
const { format } = require("winston");
const ObjectId = mongoose.Types.ObjectId;
const model = mongoose.model(MODEL_NAMES.ACCOUNT);

/**
 * Creates an account using the email and password provided
 * @param {String} email Email requested to be used
 * @param {String} password Password to authenticate the account
 * @returns An object from the DB of the created account
 */
async function createAccount(email, password) {
	const salt = await crypto.generateKey();
	const hash = await crypto.getPasswordHash(password, salt);

	logger.info(`${email} is attempting to create an account`);
	let accountData = null;

	try {
		accountData = await model.create({
			email: email,
			password: hash,
		});
	} catch (error) {
		logger.warn(`Error in [createAccount] ${formatJson(error)}`);
	}

	return accountData;
}

/**
 * Checks if an account exists based on the email address
 * @param {String} email Email address of the user
 * @returns True/False if the account exists
 */
async function accountExists(email) {
	return await model.exists({ email: email });
}

/**
 * Gets account data based based on the account ID, email, or both. Both arguments are optional,
 * however a default query is used to make sure that if executed without filling in either
 * argument, the search returns nothing.
 * @param {String} accountId Account ID used to pull up the data
 * @param {String} email Email addrress tied to the account
 * @returns An object from the DB of the account data
 */
async function getAccountData(accountId = null, email = null) {
	if (accountId) {
		return await model.findById(accountId);
	} else if (email) {
		return await model.findOne({ email });
	} else {
		return null;
	}
}

/**
 * Authenticates login information
 * @param {String} email Email address associated with the account
 * @param {String} password Password for authentication
 * @returns
 */
async function authenticateUser(password, email = null, sessionToken = null) {
	let accountData = null;
	if (sessionToken) {
		const docId = ObjectId(sessionToken);
		accountData = await model.findOne({ _id: docId }, `_id email password`);
	} else if (email) {
		accountData = await model.findOne({ email: email }, `_id email password`);
	}

	if (accountData === null || accountData.permissions === PERMISSION_LEVELS.NEED_NEW_PASSWORD) {
		return null;
	}

	if ((await crypto.verifyPassword(accountData.password, password)) === true) {
		return { id: accountData._id };
	} else {
		return null;
	}
}

/**
 * Updates the email to an account
 * @param {*} accountId ID of the account being updated
 * @param {*} newEmail New email address
 * @returns An object from the DB indicating the result of the update operation
 *
 * @note Calling this should be preceeded by an email verification and authentication check.
 */
async function updateEmail(accountId, newEmail) {
	logger.info(`${accountId} is updating their email to ${newEmail}`);
	const docId = ObjectId(accountId);
	const operationResult = await model.updateOne({ _id: docId }, { email: newEmail });
	return operationResult;
}

/**
 * Updates the password to an account
 * @param {*} accountId ID of the account being updated
 * @param {*} newPassword New password
 * @returns An object from the DB indicating the result of the update operation
 *
 * @note Calling this should be preceeded by a authentication check
 */
async function updatePassword(accountId, newPassword) {
	const salt = await crypto.generateKey();
	const newPasswordHash = await crypto.getPasswordHash(newPassword, salt);
	const docId = ObjectId(accountId);

	logger.info(`${accountId} is updating their password`);
	const operationResult = await model.updateOne({ _id: docId }, { password: newPasswordHash });
	return operationResult;
}

async function updateVerification(accountId, verificationStatus) {
	logger.info(`${accountId} verified their status to ${verificationStatus}`);
	const operationResult = await model.updateOne({ _id: docId }, { verified: verificationStatus });
	return operationResult;
}

/**
 * Deactivates the account
 * @param {*} accountId
 * @returns
 */
async function deactivateAccount(accountId) {
	logger.info(`${accountId} is deactivating their password`);
	const docId = ObjectId(accountId);
	const operationResult = await model.updateOne({ _id: docId }, { rank: PERMISSION_LEVELS.INACTIVE });
	return operationResult;
}

/**
 * Deletes the account
 * @param {*} accountId ID of the account to be deleted
 * @returns An object from the DB indicating the result of the delete operation
 *
 * @note Calling this should be preceeded by a authentication check
 */
async function deleteAccount(accountId) {
	logger.info(`${accountId} is deleting their account`);
	const docId = ObjectId(accountId);
	const operationResult = await model.deleteOne({ _id: docId });
	return operationResult;
}

async function requireNewPassword(accountId = null, email = null) {
	let identification = ``;
	if (accountId) {
		identification = `${accountId}`;
	} else if (email) {
		identification = `${email}`;
	} else {
		return;
	}
	logger.notice(`${identification} has been marked for needing a new password`);
}

async function ghostAccount(accountId = null, email = null) {}

async function banAccount(accountId = null, email = null) {}

async function setAccountState(email = null) {}

module.exports = {
	createAccount,
	accountExists,

	getAccountData,

	authenticateUser,

	updateEmail,
	updatePassword,
	updateVerification,

	deactivateAccount,

	deleteAccount,

	/* Admin only functions */
	requireNewPassword,
	ghostAccount,
	banAccount,
};
