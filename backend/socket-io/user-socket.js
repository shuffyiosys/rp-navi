const { logger, formatJson } = require("../utils/logger");
const { SocketIoResponse } = require("../classes/socket-io-response");
const { requestFriend, removeFriend, blockUser, unblockUser } = require("../services/mongodb/relationship-service");
const { getCharacterData } = require("../services/mongodb/character-service");
const { verifyUserOwnsCharacter } = require("../services/redis/character-service");
const { log } = require("winston");

async function setupSocket(io, socket) {
	logger.debug(`Setting up user socket handlers`);
	socket.on("update status", (data) =>
		handle_sendStatus(io, socket, data).catch((err) => {
			logger.info(`Error updating status ${err}`);
		})
	);

	socket.on("block user", (data, ack) =>
		main_handler(socket, data, blockUser)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error blocking user ${err}`);
				ack({ success: false, msg: "" });
			})
	);
	socket.on("unblock user", (data, ack) =>
		main_handler(socket, data, unblockUser)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error unblocking user ${err}`);
				ack({ success: false, msg: "" });
			})
	);
	socket.on("add friend", (data, ack) =>
		main_handler(socket, data, requestFriend)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error adding ${err}`);
				ack({ success: false, msg: "" });
			})
	);
	socket.on("remove friend", (data, ack) =>
		main_handler(socket, data, removeFriend)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error removing friend ${err}`);
				ack({ success: false, msg: "" });
			})
	);
}

async function handle_sendStatus(io, socket, data) {
	logger.debug(`Handling update status: ${formatJson(data)}`);
	const userId = socket.request.session.userId;
	const ownsCharacter = await verifyUserOwnsCharacter(userId, data.character);
	if (ownsCharacter == true) {
		io.emit("user status update", data);
	}
}

async function main_handler(socket, data, serviceHandler) {
	let status = new SocketIoResponse();

	const requesterData = await getCharacterData(data.requester);
	const recipientData = await getCharacterData(data.recipient);

	if (requesterData == null || recipientData == null) {
		status.msg = "One or both characters doesn't exist";
		return status;
	}

	const userId = socket.request.session.userId;
	const ownsCharacter = await verifyUserOwnsCharacter(userId, data.requester);
	if (ownsCharacter == true) {
		const relationshipData = await serviceHandler(requesterData._id, recipientData._id);
		logger.debug(`Relationship change data: ${formatJson(relationshipData)}`);
		if (relationshipData !== null) {
			status.success = true;
		}
	} else {
		status.msg = `User does not own ${data.requester}`;
	}
	return status;
}

module.exports = {
	setupSocket,
};
