const util = require('util');
const redis = require('redis');
const {
	logger
} = require('../utils/logger');

const clients = {};
let connectionTimeout = null;

function throwTimeoutError() {
	connectionTimeout = setTimeout(() => {
		throw new Error(`Error connecting to Redis`);
	}, 10000)
}

function startClient(config, clientName, promisify=false) {
	logger.info(`Connecting to Redis...`)
	if ((clientName in clients) === false) {
		let params = {
			host: config.username,
			port: config.port
		};
		
		if ('password' in config && config.password.length > 0) {
			params.password = config.password;
		}

		const newClient = redis.createClient(params);
		newClient.clientName = clientName;

		clients[clientName] = newClient;
		
		if(promisify === true) {
			promisifyFunctions(newClient);
		}

		setupEventListeners({
			conn: newClient
		})
	} else {
		logger.error(`Redis client ${clientName} already exists. ` +
			`Abort setting up a connection`);
	}
}

function connectionExists(clientName) {
	return (clientName in clients);
}

async function closeConnections() {
	Object.keys(clients).forEach(async function (client) {
		await clients[client].quit();
	})
}

function promisifyFunctions(client) {
	client.quit = util.promisify(client.quit);
	client.get = util.promisify(client.get);
	client.set = util.promisify(client.set);
	client.hmset = util.promisify(client.hmset);
	client.hgetall = util.promisify(client.hgetall);
	client.sadd = util.promisify(client.sadd);
	client.srem = util.promisify(client.srem);
	client.smembers = util.promisify(client.smembers);
	client.llen = util.promisify(client.llen);
	client.rpush = util.promisify(client.rpush);
	client.lpop = util.promisify(client.lpop);
	client.lrange = util.promisify(client.lrange);
	client.del = util.promisify(client.del);
	client.exists = util.promisify(client.exists);
}

function setupEventListeners({conn}) {
	conn.on('connect', () => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: connected`);
		clearTimeout(connectionTimeout);
	});
	conn.on('end', () => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: disconnected`);
		delete clients[conn.clientName];
	});
	conn.on('reconnecting', () => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: reconnecting`);
		clearTimeout(connectionTimeout);
	});
	conn.on('error', (err) => {
		logger.info(`[Redis] ${conn.clientName} - Connection status: error`, {
			err
		});
		throwTimeoutError();
	});
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
	closeConnections
}