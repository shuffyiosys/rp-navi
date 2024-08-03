const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

const systemHandlers = require("../socket-io/system-event-handlers");

function load(server) {
	let io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", async function (socket) {
		socket.emit("system message", "Welcome to RP Navi!");
		logger.debug(`Socket ${socket.id} connected`);

		systemHandlers.setupHandlers(io, socket);
		await setupSocketSession(io, socket);
	});

	return io;
}

const chatHandlers = require("../socket-io/chat-socket");
const dmHandlers = require("../socket-io/dm-handlers");
const userHandlers = require("../socket-io/user-socket");

const userService = require("../services/redis/user-service");
const { getCharacterList } = require("../services/mongodb/character-service");

async function setupSocketSession(io, socket) {
	const session = socket.request.session;
	if ("userId" in session == false) {
		socket.emit("login error", {});
		return;
	}

	const userId = session.userId;

	let characterList = await getCharacterList(userId);
	socket.emit("character list", characterList);

	userHandlers.setupSocket(io, socket);
	dmHandlers.setupSocket(io, socket);
	chatHandlers.setupSocket(io, socket);

	socket.on("disconnect", () => {
		logger.debug(`Socket ${socket.id} disconnected`);
	});
}

module.exports = load;
