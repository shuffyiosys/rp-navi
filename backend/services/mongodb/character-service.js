const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { MODEL_NAMES } = require("../../models/model-names");
const model = mongoose.model(MODEL_NAMES.CHARACTER);

const { logger, formatJson } = require("../../utils/logger");
const { RELATIONSHIP_TYPE } = require("../../data/character-data");

/**
 * Creates a character
 * @param {String} characterName
 * @param {String} accountID
 * @returns Document containing the created character's data.
 */
async function CreateCharacter(characterName, accountID) {
	let characterData = null;
	try {
		const ownerID = ObjectId(accountID);
		logger.info(`${accountID} is attempting to create a character ${characterName}`);
		characterData = await model.create({
			characterName: characterName,
			owner: ownerID,
		});
	} catch (error) {
		logger.warn(`Error in [CreateCharacter] ${formatJson(error)}`);
	}

	return characterData;
}

/**
 * Checks if the character exists
 * @param {String} characterName Name of character to check
 * @returns True/False if character exists
 */
async function GetCharacterExists(characterName) {
	return await model.exists({ characterName: characterName });
}

/**
 * Gets an array of the characters the account owns
 * @param {String} accountID Account ID whose character list to grab
 * @returns Array of character names
 */
async function GetCharacterList(accountID) {
	const ownerID = ObjectId(accountID);
	const characters = await model.find({ owner: ownerID }, "characterName -_id");
	const list = [];
	characters.forEach((entry) => {
		list.push(entry.characterName);
	});
	return list.sort();
}

/**
 * Gets how many characters the account has
 * @param {String} accountID
 * @returns
 */
async function GetCharacterCount(accountID) {
	const ownerID = ObjectId(accountID);
	return model.count({ owner: ownerID });
}

async function GetCharacterProfile(characterName) {
	return model.findOne(
		{ characterName: characterName },
		"characterName profileHtml profileCss profileJs includeJquery -_id"
	);
}

async function GetCharacterData(accountID, characterName) {
	const ownerID = ObjectId(accountID);
	return model.findOne({ owner: ownerID, characterName: characterName });
}

async function UpdateProfile(accountID, characterName, updateData) {
	try {
		const ownerID = ObjectId(accountID);
		const characterData = await model.findOne({ characterName: characterName, owner: ownerID });
		if (characterData !== null) {
			characterData.profileHtml = updateData.profileHtml;
			characterData.profileCss = updateData.profileCss;
			characterData.profileJs = updateData.profileJs;
			characterData.includeJquery = updateData.includeJquery;
			const response = await characterData.save();
			return response;
		}
	} catch (error) {
		logger.warn(`[UpdateProfile] Error saving profile: ${formatJson(error)}`);
	}

	return null;
}

/**
 * Requests a friend request between characters
 * @param {String} accountID ID of account that owns the character
 * @param {String} characterName Name of character the user has
 * @param {String} targetName Name of character the user wants to friend
 * @returns Number of modifications
 */
async function AddFriendRequest(accountID, characterName, targetName) {
	const ownerID = ObjectId(accountID);
	const characterData = await model.findOne({ owner: ownerID, characterName: characterName }, "friends");
	const targetData = await model.findOne({ characterName: targetName }, "friends");

	if (characterData === null || targetData === null) {
		return -1;
	}

	if (!characterData.friends.has(targetName) && !targetData.friends.has(characterName)) {
		characterData.friends.set(targetName, RELATIONSHIP_TYPE.FRIEND_REQUESTED);
		targetData.friends.set(characterName, RELATIONSHIP_TYPE.REQUEST_FRIEND);

		let updateData = await characterData.save();
		let modifiedCount = updateData.modifiedCount;
		updateData = await targetData.save();
		modifiedCount += updateData.modifiedCount;
		return modifiedCount;
	} else {
		characterData.friends.set(targetName, RELATIONSHIP_TYPE.FRIENDS);
		targetData.friends.set(characterName, RELATIONSHIP_TYPE.FRIENDS);

		let updateData = await characterData.save();
		let modifiedCount = updateData.modifiedCount;
		updateData = await targetData.save();
		modifiedCount += updateData.modifiedCount;
		return modifiedCount;
	}
}

/**
 * Gets the list of friends for a character
 * @param {String} accountID
 * @param {String} characterName
 * @returns
 */
async function GetFriendsList(accountID, characterName) {
	const ownerID = ObjectId(accountID);
	const characterData = await model.findOne({ owner: ownerID, characterName: characterName }, "friends");

	if (characterData === null) {
		return [];
	}

	const previousCount = characterData.friends.size;
	// Prune the list if the character doesn't exist
	characterData.friends.forEach(async (value, key, friendsMap) => {
		let friendExists = await model.exists(key);
		if (!friendExists) {
			friendsMap.delete(key);
		}
	});

	if (previousCount > characterData.friends.size) {
		await characterData.save();
	}
	return Array.from(characterData.friends.keys());
}

/**
 * Removes friend relationship
 * @param {String} accountID
 * @param {String} characterName
 * @param {String} targetName
 * @returns
 */
async function RemoveFriend(accountID, characterName, targetName) {
	const ownerID = ObjectId(accountID);
	const characterData = await model.findOne({ owner: ownerID, characterName: characterName }, "friends");
	const targetData = await model.findOne({ characterName: targetName }, "friends");

	if (targetData === null) {
		if (characterData === null) {
			return -1;
		} else {
			characterData.friends.delete(targetName);
			let updateData = await characterData.save();
			let modifiedCount = updateData.modifiedCount;
			return modifiedCount;
		}
	} else {
		characterData.friends.delete(targetName);
		targetData.friends.delete(characterName);
		let updateData = await characterData.save();
		let modifiedCount = updateData.modifiedCount;
		updateData = await targetData.save();
		modifiedCount += updateData.modifiedCount;
		return modifiedCount;
	}
}

async function DeleteCharacter(characterName, accountID) {
	const ownerID = ObjectId(accountID);
	logger.info(`${accountID} is deleting their character ${characterName}`);
	const deleteResult = await model.deleteOne({ characterName: characterName, owner: ownerID });
	return deleteResult;
}

module.exports = {
	CreateCharacter,

	GetCharacterExists,
	GetCharacterList,
	GetCharacterCount,
	GetCharacterProfile,
	GetCharacterData,

	UpdateProfile,

	AddFriendRequest,
	GetFriendsList,
	RemoveFriend,

	DeleteCharacter,
};
