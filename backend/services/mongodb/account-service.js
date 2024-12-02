/**
 * Handles all Account based data manipulation and interfaces with the database.
 */
const { ACCESS_LEVEL, ACCOUNT_STATE, AUTHENTICATION_RESULT } = require(`../../data/account-data`);
const { logger, formatJson } = require(`../../utils/logger`);
const { MODEL_NAMES } = require(`../../models/model-names`);
const assert = require("node:assert").strict;
const crypto = require(`../../utils/crypto`);

const mongoose = require(`mongoose`);
const ObjectId = mongoose.Types.ObjectId;
const model = mongoose.model(MODEL_NAMES.ACCOUNT);
const characterModel = mongoose.model(MODEL_NAMES.CHARACTER);

/**
 * Creates an account using the email and password provided
 * @param {String} email Email requested to be used
 * @param {String} password Password to authenticate the account
 * @returns An object from the DB of the created account
 */
async function CreateAccount(email, password) {
	logger.info(`${email} is attempting to create an account`);

	const salt = await crypto.generateKey();
	const hash = await crypto.getPasswordHash(password, salt);
	let accountData = null;

	// Because the model has set email to unique, this can cause an exception should an email that
	// already exists slips in.
	try {
		accountData = await model.create({
			email: email,
			password: hash,
			emailVerifyKey: await crypto.generateKey(),
		});
	} catch (error) {
		logger.warn(`Error in [CreateAccount] ${formatJson(error)}`);
	}

	return accountData;
}

/**
 * Checks if an account exists based on the email address
 * @param {String} email Email address of the user
 * @returns True/False if the account exists
 */
async function GetAccountExists(email) {
	return await model.exists({ email: email });
}

async function accountExistsById(accountID) {
	const docID = ObjectId(accountID);
	return await model.exists({ _id: docID });
}

/**
 * Gets account data based based on the account ID, email, or both. Both arguments are optional,
 * however a default query is used to make sure that if executed without filling in either
 * argument, the search returns nothing.
 * @param {String} accountID Account ID used to pull up the data
 * @param {String} email Email addrress tied to the account
 * @param {String} fields Fields to grab from the data
 * @returns An object from the DB of the account data
 */
async function GetAccountDataByID(accountID, fields = "_id email emailVerifyKey") {
	const docID = ObjectId(accountID);
	return await model.findById(docID, fields);
}

async function GetAccountDataByEmail(email) {
	const fields = "_id";
	return await model.findOne({ email: email }, fields);
}

/**
 * Authenticates login information
 * @param {String} email Email address associated with the account
 * @param {String} password Password for authentication
 * @returns
 */
async function AuthenticateUser(password, identification, type) {
	logger.debug(`Authenticating user ${identification}, ${type}`);
	let accountData = null;
	const fields = `_id password status accessLevel`;
	const response = { id: -1, status: AUTHENTICATION_RESULT.GENERAL_ERROR };

	if (type == "ID") {
		const docID = ObjectId(identification);
		accountData = await model.findOne({ _id: docID }, fields);
	} else if (type == "email") {
		accountData = await model.findOne({ email: identification }, fields);
	} else {
		return response;
	}

	logger.debug(`${formatJson(accountData)}`);
	if (accountData === null) {
		return response;
	} else if (accountData.accessLevel === ACCESS_LEVEL.BANNED) {
		response.status = AUTHENTICATION_RESULT.BANNED;
		return response;
	}

	const correctPassword = await crypto.VerifyPassword(accountData.password, password);
	console.log(correctPassword);
	if (!correctPassword) {
		return response;
	} else if (accountData.status == ACCOUNT_STATE.NEED_NEW_PASSOWRD) {
		response.status = AUTHENTICATION_RESULT.NEED_NEW_PASSWORD;
		return response;
	} else {
		response.id = accountData._id;
		response.status = AUTHENTICATION_RESULT.SUCCESS;
		return response;
	}
}

/**
 * Updates the email to an account
 * @param {*} accountID ID of the account being updated
 * @param {*} newEmail New email address
 * @returns An object from the DB indicating the result of the update operation
 *
 * @note Calling this should be preceeded by an authentication check.
 */
async function UpdateEmail(accountID, newEmail) {
	logger.info(`${accountID} is updating their email to ${newEmail}`);
	const docID = ObjectId(accountID);
	const operationResult = await model.updateOne(
		{ _id: docID },
		{ email: newEmail, emailVerifyKey: await crypto.generateKey() }
	);
	return operationResult;
}

/**
 * Updates the password to an account
 * @param {*} accountID ID of the account being updated
 * @param {*} newPassword New password
 * @returns An object from the DB indicating the result of the update operation
 *
 * @note Calling this should be preceeded by a authentication check
 */
async function UpdatePassword(accountID, newPassword) {
	const salt = await crypto.generateKey();
	const newPasswordHash = await crypto.getPasswordHash(newPassword, salt);
	const docID = ObjectId(accountID);

	logger.info(`${accountID} is updating their password`);
	const operationResult = await model.updateOne({ _id: docID }, { password: newPasswordHash });
	return operationResult;
}

async function UpdateVerification(accountID, verificationKey) {
	logger.info(`${accountID} is updating their email verification`);
	const docID = ObjectId(accountID);
	const operationResult = await model.updateOne(
		{ _id: docID, emailVerifyKey: verificationKey },
		{ emailVerifyKey: "" }
	);
	return operationResult;
}

/** User blocking functions **************************************************/
/**
 *
 * @param {*} accountID
 * @param {*} characterID
 * @returns
 */
async function AddBlockedUser(accountID, characterID) {
	const docID = ObjectId(accountID);
	let accountData = await model.findOne({ _id: docID }, "blocked");
	let blockedUsers = new Set(accountData.blocked);
	blockedUsers.add(characterID);
	const updateResult = await model.updateOne({ _id: docID }, { blocked: Array.from(blockedUsers) });
	return updateResult;
}

async function RemoveBlockedUser(accountID, characterID) {
	const docID = ObjectId(accountID);
	let accountData = await model.findOne({ _id: docID }, "blocked");
	let blockedUsers = new Set(accountData.blocked);
	blockedUsers.delete(characterID);
	const updateResult = await model.updateOne({ _id: docID }, { blocked: Array.from(blockedUsers) });
	return updateResult;
}

async function GetBlockedUsers(accountID) {
	const docID = ObjectId(accountID);
	let accountData = await model.findOne({ _id: docID }, "blocked");
	let blockedUsers = new Set(accountData.blocked);

	// Do some tidying up before sending the account their blocked list.
	blockedUsers.forEach((characterID) => {
		const characterDocID = ObjectId(characterID);
		if (!characterModel.exists(characterDocID)) {
			blockedUsers.delete(characterID);
		}
	});
	const blockedUsersArray = Array.from(blockedUsers);
	await model.updateOne({ _id: docID }, { blocked: blockedUsersArray });
	return blockedUsersArray;
}

/**
 * Deletes the account
 * @param {String} accountID ID of the account to be deleted
 * @returns An object from the DB indicating the result of the delete operation
 *
 * @note Calling this should be preceeded by a authentication check
 */
async function DeleteAccount(accountID) {
	logger.info(`${accountID} is deleting their account`);
	const docID = ObjectId(accountID);
	const operationResult = await model.deleteOne({ _id: docID });
	return operationResult;
}

/* Admin functions *******************************************************************************/
async function UpdateAccountState(accountID, newState) {
	logger.info(`Account ${accountID} is being updated to new state ${newState}`);
	assert.equal(
		ACCOUNT_STATE.NORMAL <= newState && newState <= ACCOUNT_STATE.NEED_NEW_PASSOWRD,
		true,
		"Provided account state was out of bounds"
	);
	const docID = ObjectId(accountID);
	const operationResult = await model.updateOne({ _id: docID }, { state: newState });
	return operationResult;
}

async function UpdateAccountPrivilegeLevel(accountID, newPrivilegeLevel) {
	logger.info(`Account ${accountID} is being updated to new privilege level ${newPrivilegeLevel}`);

	assert.equal(
		ACCESS_LEVEL.ADMIN <= newPrivilegeLevel && newPrivilegeLevel <= ACCESS_LEVEL.BANNED,
		true,
		"Provided privilege level was out of bounds"
	);

	const docID = ObjectId(accountID);
	const operationResult = await model.updateOne({ _id: docID }, { accessLevel: newPrivilegeLevel });
	return operationResult;
}

module.exports = {
	CreateAccount,

	GetAccountExists,
	accountExistsById,
	GetAccountDataByID,
	GetAccountDataByEmail,
	AuthenticateUser,

	UpdateEmail,
	UpdatePassword,
	UpdateVerification,

	AddBlockedUser,
	RemoveBlockedUser,
	GetBlockedUsers,

	DeleteAccount,

	/* Admin only functions */
	UpdateAccountState,
	UpdateAccountPrivilegeLevel,
};
