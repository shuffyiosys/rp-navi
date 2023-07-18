/**
 * Handles all Account based data manipulation and interfaces with the database.
 */
const { MODEL_NAMES } = require("../models/model-names");
const { generateKey, getPasswordHash, verifyPassword } = require("../utils/crypto");
const { PERMISSION_LEVELS } = require("../data/account-data");

const mongoose = require("mongoose");
const { logger, formatJson } = require("../utils/logger");
const { format } = require("winston");
const model = mongoose.model(MODEL_NAMES.ACCOUNT);

/**
 * Creates an account using the email and password provided
 * @param {String} email Email requested to be used
 * @param {String} password Password to authenticate the account
 * @returns An object from the DB of the created account
 */
async function createAccount(email, password) {
	const salt = await generateKey();
	const hash = await getPasswordHash(password, salt);
	const accountData = await model.create({
		email: email,
		password: hash,
	});
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
 * Gets account data based on the ID of the account
 * @param {String} accountId Account ID used to pull up the data
 * @returns An object from the DB of the account data
 */
async function getAccountData(accountId) {
	return await model.findOne({ _id: accountId }, "-password");
}

async function getAccountDataByEmail(email) {
	return await model.findOne({ email: email }, "-password");
}

/**
 * Authenticates login information
 * @param {String} email Email address associated with the account
 * @param {String} password Password for authentication
 * @returns An object containing the following:
 *  { success: {Boolean},
 *    accountId: {String}
 *  }
 */
async function authenticateUser(email, password) {
	const accountData = await model.findOne({ email: email }, "_id email password");
	return await authenticateAccount(accountData, password);
}

async function autheticateBySession(sessionToken, password) {
	const accountData = await model.findOne({ _id: sessionToken }, "_id email password");
	return await authenticateAccount(accountData, password);
}

async function authenticateAccount(accountData, password) {
	let authData = { success: false, accountId: null };
	if (accountData === null) {
		return authData;
	} else if ((await verifyPassword(accountData.password, password)) === true) {
		authData.success = true;
		authData.accountId = accountData._id;
		return authData;
	} else {
		return authData;
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
	const operationResult = await model.updateOne({ _id: accountId }, { email: newEmail });
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
	const salt = await generateKey();
	const newPasswordHash = await getPasswordHash(newPassword, salt);
	const operationResult = await model.updateOne({ _id: accountId }, { password: newPasswordHash });
	return operationResult;
}

async function updateVerification(accountId, verificationStatus) {
	const operationResult = await model.updateOne({ _id: accountId }, { verified: verificationStatus });
	return operationResult;
}

/**
 * Deactivates the account
 * @param {*} accountId
 * @returns
 */
async function deactivateAccount(accountId) {
	const operationResult = await model.updateOne({ _id: accountId }, { rank: PERMISSION_LEVELS.INACTIVE });
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
	const operationResult = await model.deleteOne({ _id: accountId });
	return operationResult;
}

module.exports = {
	createAccount,
	accountExists,

	getAccountData,
	getAccountDataByEmail,

	authenticateUser,
	autheticateBySession,
	updateEmail,
	updatePassword,
	updateVerification,
	deactivateAccount,
	deleteAccount,
};
