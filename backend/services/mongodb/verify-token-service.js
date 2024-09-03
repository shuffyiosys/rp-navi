const { MODEL_NAMES } = require("../../models/model-names");
const { generateKey } = require("../../utils/crypto");
const { logger } = require("../../utils/logger");
const mongoose = require("mongoose");
const model = mongoose.model(MODEL_NAMES.VERIFY_TOKENS);

async function GenerateToken(referenceID) {
	const token = generateKey();

	logger.info(`Creating verification token for ${referenceID}`);
	const tokenData = await model.create({
		token: token,
		referenceID: referenceID,
	});
	return tokenData;
}

async function FindByReferenceID(referenceID) {
	return await model.findOne({
		referenceID: referenceID,
	});
}

async function FindByToken(token) {
	return await model.findOne({
		token: token,
	});
}

async function VerifyTokenOwner(token, referenceID) {
	const tokenData = await model.findOne({ referenceID: referenceID });
	if (tokenData && tokenData.token == token) {
		return true;
	} else {
		logger.info(`Could not find token for ${token} from ${referenceID}`);
		return false;
	}
}

async function DeleteToken(token) {
	return await model.deleteOne({ token: token });
}

module.exports = {
	GenerateToken,
	FindByReferenceID,
	FindByToken,
	VerifyTokenOwner,
	DeleteToken,
};
