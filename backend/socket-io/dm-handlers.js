const { verifyUserOwnsCharacter, getCharacterOwner } = require(`../services/redis/character-service`);
const { getCharacterData } = require(`../services/mongodb/character-service`);
const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);

function setupSocket(io, socket) {
	const userId = socket.request.session.userId;
	socket.join(`pms/${userId}`);

	socket.on(`send dm`, (data, ack) =>
		main_handler(socket, data, handle_sendDm)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error sending a DM: ${err}`);
				ack({ success: false, msg: `` });
			})
	);

	socket.on(`send dm-status`, (data, ack) =>
		main_handler(socket, data, handle_sendDmStatus)
			.then((status) => ack(status))
			.catch((err) => {
				logger.info(`Error sending DM status: ${err}`);
				ack({ success: false, msg: `` });
			})
	);
}

async function checkCharactersExist(fromCharacter, toCharacter) {
	const requesterData = await getCharacterData(fromCharacter);
	const recipientData = await getCharacterData(toCharacter);
	if (requesterData == null || recipientData == null) {
		return false;
	} else {
		return true;
	}
}

async function main_handler(socket, data, eventHandler) {
	let status = new SocketIoResponse();
	const fromCharacter = data.fromCharacter;
	const toCharacter = data.toCharacter;

	const charactersExist = checkCharactersExist(fromCharacter, toCharacter);
	if (charactersExist == false) {
		status.msg = `One or both characters doesn't exist`;
		return status;
	}

	const userId = socket.request.session.userId;
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

module.exports = {
	setupSocket,
};
