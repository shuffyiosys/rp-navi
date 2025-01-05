const { redisClient } = require("../../loaders/redis-db");

async function setUserConnection(userId, socketId) {
	return await redisClient.HSET(`connections:${userId}`, "socketId", socketId);
}

async function getUserConnection(userId) {
	return await redisClient.HGET(`connections:${userId}`, "socketId");
}

async function removeUserConnection(userId) {
	return await redisClient.DEL(`connections:${userId}`);
}

module.exports = {
	setUserConnection,
	getUserConnection,
	removeUserConnection,
};
