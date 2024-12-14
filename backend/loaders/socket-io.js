const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

const systemHandlers = require("../socket-io/system-event-handlers");

function load(server) {
	let io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", async function (socket) {
		if ("userID" in socket.request.session) {
			connectHandlersSession(io, socket);
		} else {
			socket.on("logged in", () => {
				connectHandlersSession(io, socket);
			});
		}
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
	socket.emit("system message", "Welcome to RP Navi!");
	socket.emit("login status", { loggedIn: "userID" in session });
	logger.debug(`Socket ${socket.id} connected`);

	// Check connections
	await userService.setUserConnection(session.userID, socket.id);

	characterHandlers.connectHandlers(io, socket);
	// userHandlers.connectHandlers(io, socket);
	// dmHandlers.connectHandlers(io, socket);
	chatHandlers.connectHandlers(io, socket);

	// Handle disconnect
	socket.on("disconnect", async () => {
		chatHandlers.removeInRooms(io, socket);
		logger.debug(`Socket ${socket.id} disconnected`);
	});
}

module.exports = load;
