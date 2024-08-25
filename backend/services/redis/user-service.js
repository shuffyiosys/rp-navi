const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

async function setUserConnection(userId, socketId) {
	const query = `connections:${userId}`;
	let result = await redisClient.hset(query, "socketId", socketId);
	return result;
}

async function getUserConnection(userId) {
	const query = `connections:${userId}`;
	let result = await redisClient.hget(query, "socketId");
	return result;
}

async function removeUserConnection(userId) {
	const query = `connections:${userId}`;
	let result = await redisClient.del(query);
	return result;
}

module.exports = {
	setUserConnection,
	getUserConnection,
	removeUserConnection,
};
