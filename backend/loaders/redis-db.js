/**
 * @file Establishes different clients to connect to a Redis server
 */
const Redis = require("ioredis");
const { logger, formatJson } = require("../utils/logger");

let redisClient = {
	exists: warnFailedInit,
	hmset: warnFailedInit,
	hset: warnFailedInit,
	hget: warnFailedInit,
	hgetall: warnFailedInit,

	smembers: warnFailedInit,
	scard: warnFailedInit,
	sismember: warnFailedInit,
	sadd: warnFailedInit,
	srem: warnFailedInit,

	llen: warnFailedInit,
	lrange: warnFailedInit,
	rpush: warnFailedInit,
	del: warnFailedInit,
};

function warnFailedInit() {
	var path = require("path");
	var scriptName = path.basename(__filename);
	logger.warn(`[${scriptName}] Redis client hasn't been initialized!`);
}

function connectToServer(serverConfig) {
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

	redisClient = new Redis(params);
	module.exports.redisClient = redisClient;
}

async function pingServer() {
	return (await redisClient.ping()) == "PONG";
}

module.exports = {
	connectToServer,
	pingServer,
};
