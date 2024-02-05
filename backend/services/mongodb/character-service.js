const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { MODEL_NAMES } = require("../../models/model-names");
const { logger, formatJson } = require("../../utils/logger");
const model = mongoose.model(MODEL_NAMES.CHARACTER);

async function createCharacter(characterName, accountId) {
	const ownerId = ObjectId(accountId);
	logger.info(`${accountId} is attempting to create a character ${characterName}`);
	const characterData = await model.create({
		charaName: characterName,
		owner: ownerId,
		profileHtml: "",
		profileCss: "",
		profileJs: "",
	});
	return characterData;
}

async function getCharacterExists(characterName) {
	return await model.exists({ charaName: characterName });
}

async function getCharacters(accountId) {
	const ownerId = ObjectId(accountId);
	return model.find({ owner: ownerId }, "charaName");
}

async function getCharacterProfile(characterName) {
	return model.findOne({ charaName: characterName }, "charaName profileHtml profileCss profileJs");
}

async function getCharacterData(characterName) {
	return model.findOne({ charaName: characterName });
}

async function updateProfile(characterName, accountId, updateData) {
	const ownerId = ObjectId(accountId);
	const characterData = await model.findOne({ charaName: characterName, owner: ownerId });
	if (characterData !== null) {
		characterData.profileHtml = updateData.profileHtml;
		characterData.profileCss = updateData.profileCss;
		characterData.profileJs = updateData.profileJs;
		const response = await characterData.save();
		return response;
	}
	return null;
}

async function deleteCharacter(characterName, accountId) {
	const ownerId = ObjectId(accountId);
	logger.info(`${accountId} is deleting their character ${characterName}`);
	const operationResult = await model.deleteOne({ charaName: characterName, owner: ownerId });
	return operationResult;
}

module.exports = {
	createCharacter,
	getCharacterExists,
	getCharacters,
	getCharacterProfile,
	getCharacterData,
	updateProfile,
	deleteCharacter,
};
