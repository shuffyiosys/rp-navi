const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { MODEL_NAMES } = require("../../models/model-names");
const { logger, formatJson } = require("../../utils/logger");
const model = mongoose.model(MODEL_NAMES.CHARACTER);

async function createCharacter(characterName, accountId) {
	let characterData = null;
	try {
		const ownerId = ObjectId(accountId);
		logger.info(`${accountId} is attempting to create a character ${characterName}`);
		characterData = await model.create({
			characterName: characterName,
			owner: ownerId,
		});
	} catch (error) {
		logger.warn(`Error in [createCharacter] ${formatJson(error)}`);
	}

	return characterData;
}

async function getCharacterExists(characterName) {
	return await model.exists({ characterName: characterName });
}

async function getCharacterList(accountId) {
	const ownerId = ObjectId(accountId);
	const characters = await model.find({ owner: ownerId }, "characterName -_id");
	const list = [];
	characters.forEach((entry) => {
		list.push(entry.characterName);
	});
	return list.sort();
}

async function getCharacterCount(accountId) {
	const ownerId = ObjectId(accountId);
	return model.count({ owner: ownerId });
}

async function getCharacterProfile(characterName) {
	return model.findOne(
		{ characterName: characterName },
		"characterName profileHtml profileCss profileJs includeJquery -_id"
	);
}

async function getCharacterData(characterName) {
	return model.findOne({ characterName: characterName });
}

async function updateProfile(characterName, accountId, updateData) {
	try {
		const ownerId = ObjectId(accountId);
		const characterData = await model.findOne({ characterName: characterName, owner: ownerId });
		if (characterData !== null) {
			characterData.profileHtml = updateData.profileHtml || characterData.profileHtml;
			characterData.profileCss = updateData.profileCss || characterData.profileCss;
			characterData.profileJs = updateData.profileJs || characterData.profileJs;
			characterData.includeJquery = updateData.includeJquery || characterData.includeJquery;
			const response = await characterData.save();
			return response;
		}
	} catch (error) {
		logger.warn(`[updateProfile] Error saving profile: ${formatJson(error)}`);
	}

	return null;
}

async function deleteCharacter(characterName, accountId) {
	const ownerId = ObjectId(accountId);
	logger.info(`${accountId} is deleting their character ${characterName}`);
	const operationResult = await model.deleteOne({ characterName: characterName, owner: ownerId });
	return operationResult;
}

module.exports = {
	createCharacter,
	getCharacterExists,
	getCharacterList,
	getCharacterCount,
	getCharacterProfile,
	getCharacterData,
	updateProfile,
	deleteCharacter,
};
