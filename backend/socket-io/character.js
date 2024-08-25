const { logger, formatJson } = require(`../utils/logger`);
const { SocketIoResponse } = require(`../classes/socket-io-response`);
const characterMongoDb = require(`../services/mongodb/character-service`);
const characterRedisDb = require(`../services/redis/character-service`);

async function handleGetOwnedCharacters(socket, data) {
	const userId = socket.request.session.userId;
	const characterList = await characterMongoDb.getCharacterList(userId);
	socket.emit("character list", characterList);

	characterList.forEach((characterName) => {
		characterRedisDb.addCharacterOwner(characterName, userId);
	});
}

async function handleGetCharacterData(socket, data) {
	const characterData = await characterRedisDb.getCharacterdata(data.name);
	socket.emit("character data", characterData);
}

async function connectHandlers(io, socket) {
	socket.on("get owned characters", (data) => handleGetOwnedCharacters(socket, data));
	socket.on("get character data", (data) => handleGetCharacterData(socket, data));
}

module.exports = {
	connectHandlers,
};
