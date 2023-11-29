const { logger } = require("../utils/logger");
const { getCharacters } = require("../services/character-service");
const { validateKeys } = require("../utils/socket-utils");

async function setupHandlers(io, socket, redisClient) {
	socket.on("disconnect", function () {
		handle_disconnect(socket);
	});

	socket.on("post system message", function (data) {
		handle_postSystemMessage(io, socket, data);
	});
}

let connections = {};

function checkNumberConnections(socket) {
	const remoteIp = socket.request.socket.remoteAddress;
	if (remoteIp in connections == false) {
		connections[remoteIp] = 1;
	} else if (connections[remoteIp] < 3) {
		connections[remoteIp]++;
		logger.info(`User ${session.userId} connected using socket ID ${socket.id}`);
		socket.emit("connected");
	} else {
		logger.info(`User ${session.userId} has too many connections`);
		socket.disconnect();
	}
}

function handle_disconnect(socket) {
	logger.info("Handling /disconnect: ", socket.id);
}

function handle_sendAccountInfo(io, socket, data) {
	logger.info("Handling /send account info");
}

function handle_postSystemMessage(io, socket, data) {
	logger.info("Handling /post system message");
}

module.exports = {
	setupHandlers,
};
