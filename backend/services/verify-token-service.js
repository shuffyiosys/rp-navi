const mongoose = require("mongoose");
const { MODEL_NAMES } = require("../models/model-names");
const model = mongoose.model(MODEL_NAMES.VERIFY_TOKENS);
const { generateKey } = require("../utils/crypto");
const { logger } = require("../utils/logger");

async function generateToken(action, referenceId) {
	const token = generateKey();

	logger.info(`Creating verification token for ${referenceId}`);
	const tokenData = await model.create({
		token: token,
		action: action,
		referenceId: referenceId,
	});
	return tokenData;
}

async function getToken(token = null, action = null, referenceId = null) {
	let searchQuery = {};
	if (token) {
		searchQuery.token = token;
	}
	if (action) {
		searchQuery.action = action;
	}
	if (referenceId) {
		searchQuery.referenceId = referenceId;
	}
	return model.findOne(searchQuery);
}

async function verifyRequest(token, action, referenceId) {
	const tokenData = await model.findOne({ referenceId: referenceId });
	if (tokenData && tokenData.action == action && tokenData.referenceId == referenceId) {
		return true;
	} else {
		logger.info(`Could not find token for ${token} from ${referenceId}`);
		return false;
	}
}

async function deleteToken(token = "", action = "", referenceId = "") {
	let searchQuery = {};
	if (token) {
		searchQuery.token = token;
	}
	if (action) {
		searchQuery.action = action;
	}
	if (referenceId) {
		searchQuery.referenceId = referenceId;
	}
	return model.deleteOne(searchQuery);
}

module.exports = {
	generateToken,
	getToken,
	verifyRequest,
	deleteToken,
};
