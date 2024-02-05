const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

async function addUserConnection(userId, socketId) {
	const query = `connections:${userId}`;
	let result = await redisClient.sadd(query, socketId);
	return result;
}

async function removeUserConnection(userId, socketId) {
	const query = `connections:${userId}`;
	let result = await redisClient.srem(query, socketId);
	return result;
}

async function getNumUserConnections(userId) {
	const query = `connections:${userId}`;
	return await redisClient.scard(query);
}

async function clearUserConnections() {
	const query = `connections:*`;
	let connections = await redisClient.keys(query);
	connections.forEach((connection) => {
		redisClient.del(connection);
	});
}

module.exports = {
	addUserConnection,
	removeUserConnection,
	getNumUserConnections,
	clearUserConnections,
};
