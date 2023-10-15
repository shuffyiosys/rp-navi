/**
 * @file Establishes different clients to connect to a Redis server
 */
const config = require('../config/config')();
const { promisify } = require("util");
const redis = require("redis");
const { logger } = require("../utils/logger");

const clients = {};
let connectionTimeout = null;

function startClient(clientName, promisify = false) {
	logger.info(`Connecting to Redis...`);
	if (clientName in clients === true) {
		logger.notice(`Redis client ${clientName} already exists. Abort setting up a connection`);
		return null;
	}

	let params = {
		host: config.username,
		port: config.port,
	};

	if ("password" in config && config.password.length > 0) {
		params.password = config.password;
	}

	const newClient = redis.createClient(params);
	newClient.clientName = clientName;

	clients[clientName] = newClient;

	if (promisify === true) {
		promisifyClient(newClient);
	}

	setupEventListeners({ conn: newClient });
	return newClient;
}

function connectionExists(clientName) {
	return clientName in clients;
}

async function closeAllConnections() {
	Object.keys(clients).forEach(async function (client) {
		await clients[client].quit();
	});
}

function promisifyClient(client) {
	promisify(client.quit).bind(client);
	promisify(client.get).bind(client);
	promisify(client.set).bind(client);
	promisify(client.hmset).bind(client);
	promisify(client.hgetall).bind(client);
	promisify(client.sadd).bind(client);
	promisify(client.srem).bind(client);
	promisify(client.smembers).bind(client);
	promisify(client.llen).bind(client);
	promisify(client.rpush).bind(client);
	promisify(client.lpop).bind(client);
	promisify(client.lrange).bind(client);
	promisify(client.del).bind(client);
	promisify(client.exists).bind(client);
}

function setupEventListeners({ conn }) {
	conn.on("connect", () => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: connected`);
		clearTimeout(connectionTimeout);
	});
	conn.on("end", () => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: disconnected`);
		delete clients[conn.clientName];
	});
	conn.on("reconnecting", () => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: reconnecting`);
		clearTimeout(connectionTimeout);
	});
	conn.on("error", (err) => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: error`, {
			err,
		});
		throwTimeoutError();
	});
}

function throwTimeoutError() {
	connectionTimeout = setTimeout(() => {
		throw new Error(`Error connecting to Redis`);
	}, 10000);
}

function getClient(clientName) {
	if (clientName in clients) {
		return clients[clientName];
	} else {
		return null;
	}
}

module.exports = {
	startClient,
	connectionExists,
	getClient,
	closeAllConnections,
};
