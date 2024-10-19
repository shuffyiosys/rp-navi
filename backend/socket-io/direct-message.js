const { getCharacterOwner } = require(`../services/redis/character-service`);
const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);

async function checkCharactersExist(fromCharacter, toCharacter) {
	const requesterData = await GetCharacterData(fromCharacter);
	const recipientData = await GetCharacterData(toCharacter);
	if (requesterData == null || recipientData == null) {
		return false;
	} else {
		return true;
	}
}

async function mainHandler(socket, data, eventHandler) {
	let status = new SocketIoResponse();
	const fromCharacter = data.fromCharacter;
	const toCharacter = data.toCharacter;

	const charactersExist = checkCharactersExist(fromCharacter, toCharacter);
	if (charactersExist == false) {
		status.msg = `One or both characters doesn't exist`;
		return status;
	}

	const userId = socket.request.session.userID;
	const userOwnsCharacter = await verifyUserOwnsCharacter(userId, fromCharacter);
	logger.debug(`${userId} owns ${fromCharacter}? ${userOwnsCharacter}`);
	if (userOwnsCharacter == false) {
		return status;
	}

	const toUserId = await getCharacterOwner(toCharacter);
	if (toUserId == null) {
		return status;
	}

	/* There's no further checking, so default status success to true */
	status.success = true;
	await eventHandler(socket, data, toUserId);
	return status;
}

async function handle_sendDm(socket, data, toUserId) {
	logger.debug(`Handling "send dm": ${formatJson(data)}`);
	socket.to(`pms/${toUserId}`).emit(`dm message`, data);
}

async function handle_sendDmStatus(socket, data, toUserId) {
	logger.debug(`Handling "send dm status": ${formatJson(data)}`);
	socket.to(`pms/${toUserId}`).emit(`dm status`, data);
}

function connectHandlers(server, socket) {
	socket.on(`send dm`, (data, ack) =>
		mainHandler(socket, data, handle_sendDm)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error sending a DM: ${err}`);
				ack({ success: false, msg: `` });
			})
	);

	socket.on(`send dm-status`, (data, ack) =>
		mainHandler(socket, data, handle_sendDmStatus)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error sending DM status: ${err}`);
				ack({ success: false, msg: `` });
			})
	);
}

module.exports = {
	connectHandlers,
};
