const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

const chatHandlers = require("../socket-io/chat-socket");
const dmHandlers = require("../socket-io/dm-handlers");
const systemHandlers = require("../socket-io/system-event-handlers");

function load(server, redisClient) {
	let io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", async function (socket) {
		socket.emit("info", "Welcome to RP Navi!");

		systemHandlers.setupHandlers(io, socket, redisClient);

		/* If the user is logged in, send their characters. */
		const session = socket.request.session;
		if ("userId" in session) {
			chatHandlers.setupSocket(io, socket, redisClient);
			dmHandlers.setupSocket(io, socket, redisClient);
		} else {
			socket.emit("login error", {});
		}
	});

	return io;
}

module.exports = load;
