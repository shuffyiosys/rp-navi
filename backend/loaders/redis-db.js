/**
 * @file Establishes different clients to connect to a Redis server
 */
const Redis = require("ioredis");
const { logger, formatJson } = require("../utils/logger");

async function connectToServer(serverConfig) {
	let params = {
		host: "localhost",
		port: "6379",
		password: "",
	};

	if (serverConfig) {
		params = {
			host: serverConfig.url || "localhost",
			port: serverConfig.port || "6379",
			password: serverConfig.password || "",
		};
	}
	logger.info(`Connecting to Redis server with params ${formatJson(params, false)}`);

	const redisConnection = new Redis(params);
	return redisConnection;
}

module.exports = {
	connectToServer,
};
