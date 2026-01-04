const { redisClient } = require("../../loaders/redis-db");

async function setUserConnection(userID, socketID) {
	return await redisClient.SADD(`connections:${userID}`, socketID);
}

async function getUserConnection(userID) {
	return await redisClient.SMEMBERS(`connections:${userID}`);
}

async function removeUserConnection(userID, socketID) {
	return await redisClient.SREM(`connections:${userID}`, socketID);
}

async function removeUser(userID) {
	return await redisClient.DEL(`connections:${userID}`);
}

module.exports = {
	setUserConnection,
	getUserConnection,
	removeUserConnection,
	removeUser,
};
