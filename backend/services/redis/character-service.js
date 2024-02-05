const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");
const { getCharacters } = require("../mongodb/character-service");

async function addUserCharacters(userId) {
	const characterList = await getCharacters(userId);
	let characterIds = [];
	characterList.forEach((character) => characterIds.push(character.charaName));
	await redisClient.sadd(`characterLists:${userId}`, characterIds);

	let characterOwnerMap = {};
	characterList.forEach((character) => (characterOwnerMap[character.charaName] = userId));
	await redisClient.hmset(`characterOwnerMaps`, characterOwnerMap);

	return characterIds;
}

async function verifyUserOwnsCharacter(userId, characterId) {
	const ownership = await redisClient.sismember(`characterLists:${userId}`, characterId);
	return ownership == 1;
}

async function getOwnedCharacters(userId) {
	return await redisClient.smembers(`characterLists:${userId}`);
}

async function getCharacterOwner(characterId) {
	return await redisClient.hget(`characterOwnerMaps`, characterId);
}

module.exports = {
	addUserCharacters,
	verifyUserOwnsCharacter,
	getOwnedCharacters,
	getCharacterOwner,
};
