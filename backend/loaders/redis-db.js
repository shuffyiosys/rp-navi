/**
 * @file Establishes different clients to connect to a Redis server
 */
const Redis = require("redis");
const { logger, formatJson } = require("../utils/logger");

async function connectToServer(serverEnvironment) {
	let params = {
		host: serverEnvironment.REDIS_DB_IP,
		port: serverEnvironment.REDIS_DB_PORT,
		password: serverEnvironment.REDIS_DB_PASSWORD,
	};

	logger.debug(`Connecting to Redis server with params ${formatJson(params, false)}`);
	let client = Redis.createClient(params);
	await client.connect();
	module.exports.redisClient = client;
}

module.exports = {
	connectToServer,
};
