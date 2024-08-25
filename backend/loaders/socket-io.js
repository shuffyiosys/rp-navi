const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

const systemHandlers = require("../socket-io/system-event-handlers");

function load(server) {
	let io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", async function (socket) {
		socket.emit("system message", "Welcome to RP Navi!");
		logger.debug(`Socket ${socket.id} connected`);

		systemHandlers.connectHandlers(io, socket);
		connectHandlersSession(io, socket);
	});

	return io;
}

const chatHandlers = require("../socket-io/chat-room");
const dmHandlers = require("../socket-io/direct-message");
const userHandlers = require("../socket-io/account");
const characterHandlers = require("../socket-io/character");

const userService = require("../services/redis/user-service");

async function connectHandlersSession(io, socket) {
	const session = socket.request.session;
	if ("userId" in session == false) {
		socket.emit("login error", {});
		return;
	}

	await userService.setUserConnection(session.userId, socket.id);
	characterHandlers.connectHandlers(io, socket);
	// userHandlers.connectHandlers(io, socket);
	// dmHandlers.connectHandlers(io, socket);
	chatHandlers.connectHandlers(io, socket);

	socket.on("disconnect", async () => {
		const socketId = await userService.getUserConnection(session.userId);

		logger.debug(`Socket ${socket.id} disconnected`);
		if (socketId == socket.id) {
			chatHandlers.removeInRooms(io, socket);
		} else {
			logger.debug(`Other connection is done`);
		}
	});
}

module.exports = load;
