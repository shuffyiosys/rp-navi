const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

const chatHandlers = require("./chat-socket");

function load(server) {
	let io = new Server(server, { cors: { origin: "*" } });
	listenerCallback(io);
	return io;
}

function listenerCallback(io) {
	// Create Redis connection
	io.on("connection", function (socket) {
		console.log("Socket connected", socket.id);
		socket.emit("connected");
	});
	io.of("/chat").on("connection", (socket) => {
		console.log("Connection made to /chat", socket.id);
	});
	io.of("/dms").on("connection", (socket) => {
		console.log("Connection made to /dms", socket.id);
	});
}

module.exports = load;
