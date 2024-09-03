const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);
const { getCharacterData } = require(`../services/mongodb/character-service`);
const { verifyUserOwnsCharacter } = require(`../services/redis/character-service`);

async function connectHandlers(io, socket) {
	logger.debug(`Setting up user socket handlers`);
	socket.on(`update status`, (data) =>
		handle_sendStatus(io, socket, data).catch((err) => {
			logger.info(`Error updating status ${err}`);
		})
	);
}

async function handle_sendStatus(io, socket, data) {
	logger.debug(`Handling update status: ${formatJson(data)}`);
	const userId = socket.request.session.userID;
	const ownsCharacter = await verifyUserOwnsCharacter(userId, data.character);
	if (ownsCharacter == true) {
		io.emit(`user status update`, data);
	}
}

async function main_handler(socket, data, serviceHandler) {
	let status = new SocketIoResponse();

	const requesterData = await getCharacterData(data.requester);
	const recipientData = await getCharacterData(data.recipient);

	if (requesterData == null || recipientData == null) {
		status.msg = `One or both characters doesn't exist`;
		return status;
	}

	const userId = socket.request.session.userID;
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
	connectHandlers,
};
