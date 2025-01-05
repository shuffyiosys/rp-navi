/**
 * Stores Redis data where the subkey is the character name
 */
// const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

async function getData(characterName) {
	return await redisClient.HGETALL(`characterData:${characterName}`);
}

async function updateStatus({ characterName, newStatus }) {
	return await redisClient.HSET(`characterData:${characterName}`, newStatus);
}

module.exports = {
	getData,
	updateStatus,
};
