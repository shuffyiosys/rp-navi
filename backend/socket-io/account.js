const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);
const { GetCharacterData } = require(`../services/mongodb/character-service`);
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

module.exports = {
	connectHandlers,
};
