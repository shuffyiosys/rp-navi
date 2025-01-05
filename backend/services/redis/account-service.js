/**
 * Handles all Redis keys where the subkey uses the account ID.
 */
// const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

async function addOwner(characterName, userID) {
	let result = await redisClient.SADD(`characters:${userID}`, characterName);
	// TODO: Add a TTL to this.
	return result;
}

async function verifyOwner(characterName, userID) {
	return (await redisClient.SISMEMBER(`characters:${userID}`, characterName)) == 1;
}

async function getCharacters(userID) {
	return await redisClient.SMEMBERS(`characters:${userID}`);
}

async function incrementInRoom(userID, roomName) {
	return await redisClient.HINCRBY(`inRoom:${userID}`, roomName, 1);
}

async function getInRooms(userID) {
	return await redisClient.HKEYS(`inRoom:${userID}`);
}

async function clearInRooms(userID) {
	return await redisClient.DEL(`inRoom:${userID}`);
}

async function decrementInRoom(userID, roomName) {
	const key = `inRoom:${userID}`;
	const count = await redisClient.HINCRBY(key, roomName, -1);
	if (count == 0) {
		redisClient.DEL(key);
	}
	return count;
}

module.exports = {
	addOwner,
	verifyOwner,
	getCharacters,

	incrementInRoom,
	getInRooms,
	clearInRooms,
	decrementInRoom,
};
