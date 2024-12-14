const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

async function CreateCharacterData(characterName) {
	const key = `characterData:${characterName}`;
	const doesExist = await redisClient.exists(key);

	if (doesExist == 0) {
		let characterData = {
			statusType: 0,
			statusMsg: "",
		};

		for (item in characterData) {
			await redisClient.hset(key, item, characterData[item]);
		}
	}

	return await redisClient.hgetall(key);
}

async function GetCharacterData(characterName) {
	return await redisClient.hgetall(`characterData:${characterName}`);
}

async function updateCharacterStatusType(characterName, newStatus) {
	const key = `characterData:${characterName}`;
	const exists = await redisClient.exists(key);
	return await redisClient.hgetall(key);
}

async function updateCharacterStatusMsg(characterName, newMessage) {
	const key = `characterData:${characterName}`;
	const exists = await redisClient.exists(key);

	if (exists == 1) {
		await redisClient.hset(key, STATUS_MSG_KEY, newMessage);
	}
	return await redisClient.hgetall(key);
}

async function addCharacterOwner(characterName, userId) {
	let result = await redisClient.hset(`characterOwnership`, characterName, userId);
	return result;
}

async function getCharacterOwner(characterName) {
	return await redisClient.hget(`characterOwnership`, characterName);
}

async function addCharacterInRoom(characterName, roomName) {
	const key = `inRoom:${characterName}`;
	let result = await redisClient.sadd(key, roomName);
	return result;
}

async function getRoomsWithCharacter(characterName) {
	const key = `inRoom:${characterName}`;
	return await redisClient.smembers(key);
}

async function removeRoomWithCharacter(characterName, roomName) {
	const key = `inRoom:${characterName}`;
	let result = await redisClient.srem(key, roomName);
	return result;
}

module.exports = {
	CreateCharacterData,
	GetCharacterData,

	updateCharacterStatusType,
	updateCharacterStatusMsg,

	addCharacterOwner,
	getCharacterOwner,

	addCharacterInRoom,
	getRoomsWithCharacter,
	removeRoomWithCharacter,
};
