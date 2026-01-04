const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

// const systemHandlers = require("../socket-io/system-event-handlers");

function load(server) {
	let io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", async function (socket) {
		const req = socket.request;

		if ("userID" in socket.request.session) {
			socket.emit("login status", { loggedIn: "userID" in socket.request.session });
			connectHandlersSession(io, socket);
		} else {
			socket.on("logged in", () => {
				req.session.reload((err) => {
					if (err) {
						return socket.disconnect();
					}
					req.session.save();
					connectHandlersSession(io, socket);
				});
			});
		}
	});

	return io;
}

const chatHandlers = require("../socket-io/chat-room");
// const dmHandlers = require("../socket-io/direct-message");
// const userHandlers = require("../socket-io/account");
const { setUserConnection, removeUserConnection } = require("../services/redis/user-service");

async function connectHandlersSession(io, socket) {
	socket.emit("system message", "Welcome to RP Navi!");
	logger.debug(`Socket ${socket.id} connected`);

	setUserConnection(socket.request.session.userID, socket.id);
	chatHandlers.connectHandlers(io, socket);
	// userHandlers.connectHandlers(io, socket);
	// dmHandlers.connectHandlers(io, socket);

	// Handle disconnect
	socket.on("disconnect", async () => {
		chatHandlers.removeInRooms(socket);
		removeUserConnection(socket.request.session.userID, socket.id);
		logger.debug(`Socket ${socket.id} disconnected`);
	});

	socket.on("test sig", () => {
		console.log(socket.nsp.adapter.rooms);
	});
}

module.exports = load;
