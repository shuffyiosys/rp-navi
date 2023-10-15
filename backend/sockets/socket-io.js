const express = require("express");
const { createServer } = require("node:http");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

const chatHandlers = require('./chat-socket');

function setupSocketIoServer(config) {
	const httpsPort = config.socketio.httpsPort;
	const httpPort = config.socketio.httpPort;
	let sioApp = express();
	let server = null;

	/* Create and start server ***************************************************/
	if (config.socketio.httpsPort && config.certs.certFile && config.certs.keyFile) {
		const certFilename = ""; //path.join(config.certs.path, config.certs.certFile);
		const keyFilename = ""; //path.join(config.certs.path, config.certs.keyFile);
		logger.debug(`Using cert file ${certFilename}, key file ${keyFilename}`);
		if (fs.existsSync(keyFilename) && fs.existsSync(certFilename)) {
			let options = {
				key: fs.readFileSync(keyFilename),
				cert: fs.readFileSync(certFilename),
			};
			server = https.createServer(options, sioApp);
			startServer(server, httpsPort);
		} else {
			logger.warn(`SSL certs not found; Socket.IO server starting in HTTP mode`);
			server = http.createServer(sioApp);
		}
	} else {
		server = http.createServer(sioApp);
	}

	if (server !== null) {
		startServer(server, httpPort);
	}
}

function startServer(server, port) {
	logger.info(`Starting Socket.IO server at port ${port}`);
	let io = new Server(server, { cors: {origin: "*"} });
	server.listen(port, () => listenerCallback(io));
}

function listenerCallback(io) {
	io.on("connection", (socket) => {
		chatHandlers.setupSocket(io, socket);
	});
}

module.exports = {
	setupSocketIoServer,
};
