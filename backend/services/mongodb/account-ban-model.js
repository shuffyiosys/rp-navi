/**
 * Handles Account Ban database functions
 */
const { logger, formatJson } = require(`../../utils/logger`);
const { MODEL_NAMES } = require(`../../models/model-names`);

const mongoose = require(`mongoose`);
const model = mongoose.model(MODEL_NAMES.ACCOUNT_BAN);
const ObjectId = mongoose.Types.ObjectId;

async function addBan(accountID, banReason, expiryDate) {
	logger.notice(`${accountID} is being banned`);

	let accountData = null;
	try {
		const docID = ObjectId(accountID);
		accountData = await model.create({
			accountID: docID,
			reason: banReason,
			expireAt: expiryDate,
		});
	} catch (error) {
		logger.warn(`Error in [CreateAccount] ${formatJson(error)}`);
	}

	return accountData;
}

async function getBannedAccounts() {}

async function removeBan(accountID) {
	logger.notice(`${accountID} is being unbanned`);
	const docID = ObjectId(accountID);
	const operationResult = await model.deleteOne({ accountID: docID });
	return operationResult;
}

module.exports = {
	addBan,
	getBannedAccounts,
	removeBan,
};
