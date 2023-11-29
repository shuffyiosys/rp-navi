const { validateKeys } = require("../utils/socket-utils");
const { logger } = require("../utils/logger");

function setupSocket(io, socket, redisClient) {
	socket.on("disconnect", function () {
		handle_disconnect(socket);
	});

	socket.on("send dm", function (data) {
		let status = { success: false, msg: "" };
		if (validateKeys(data, ["to", "from", "message"]) == true) {
			status = handle_sendDm(socket, io, data);
		}
		ack(status);
	});
}

function handle_disconnect(socket) {
	logger.info("Handling /dms/disconnect", socket.id);
}

function handle_sendDm(socket, io, data) {
	logger.info("Handling /dms/send dm", data);
	const toUser = data.to;
	let status = { success: false, msg: "" };
	if (socket.rooms.has(toUser)) {
		socket.to(toUser).emit("dm sent", data);
		status.success = true;
	}
	return status;
}

module.exports = {
	setupSocket,
};
