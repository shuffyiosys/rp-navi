const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

function loadModule() {
	getPublicRoomNames().then((rooms) => {
		rooms.forEach((room) => {
			clearInRoom(room);
		});
	});
}

/*****************************************************************************/
async function createRoom(data) {
	const roomQuery = `room:${data.roomName}`;
	let newRoom = {
		roomName: data.roomName,
		owner: data.characterName,
		isPrivate: data.isPrivate || false,
		description: data.description || "",
		password: data.password || "",
	};

	logger.debug(`Creating room ${newRoom}`);
	if (newRoom.isPrivate == false) {
		await redisClient.sadd("publicRoomNames", data.roomName);
	}
	await redisClient.sadd("roomNames", data.roomName);
	return await redisClient.hset(roomQuery, newRoom);
}

async function removeRoom(roomName) {
	let deletedData = {};
	const roomQuery = `room:${roomName}`;
	const inRoomQuery = `room:${roomName}:inRoom`;
	const modsQuery = `room:${roomName}:mods`;
	const bannedQuery = `room:${roomName}:banned`;
	const logQuery = `room:${roomName}:chatlog`;

	deletedData.room = await redisClient.del(roomQuery);
	deletedData.inRoom = await redisClient.del(inRoomQuery);
	deletedData.mods = await redisClient.del(modsQuery);
	deletedData.banned = await redisClient.del(bannedQuery);
	deletedData.logs = await redisClient.del(logQuery);
	redisClient.srem("publicRoomNames", roomName);
	redisClient.srem("roomNames", roomName);

	return deletedData;
}

async function getPublicRoomNames() {
	return await redisClient.smembers("publicRoomNames");
}

async function checkRoomExists(roomName) {
	return await redisClient.sismember("roomNames", roomName);
}

/*****************************************************************************/
async function getRoomData(roomName, modRequest = false) {
	const roomQuery = `room:${roomName}`;
	let roomData = await redisClient.hgetall(roomQuery);

	if (Object.keys(roomData).length === 0) {
		return roomData;
	}

	roomData.mods = await redisClient.smembers(`room:${roomName}:mods`);
	roomData.users = await redisClient.smembers(`room:${roomName}:inRoom`);

	if (modRequest) {
		const banned = await redisClient.smembers(`room:${roomName}:banned`);
		if (roomData.password.length > 0) {
			roomData.password = true;
		} else {
			roomData.password = false;
		}
		if (banned) {
			roomData.banned = banned;
		}
	} else {
		delete roomData.privateRoom;
		delete roomData.password;
	}

	return roomData;
}

async function setDescription(roomName, description) {
	const roomQuery = `room:${roomName}`;
	return await redisClient.hmset(roomQuery, { description: description });
}

async function setPassword(roomName, password) {
	const roomQuery = `room:${roomName}`;
	return await redisClient.hmset(roomQuery, { password: password });
}

async function setPrivate(roomName, privacy) {
	const roomQuery = `room:${roomName}`;
	return await redisClient.hmset(roomQuery, { private: privacy.toString() });
}

/*****************************************************************************/
async function addInRoom(roomName, characterId) {
	const inRoomQuery = `room:${roomName}:inRoom`;
	return await redisClient.sadd(inRoomQuery, characterId);
}

async function getUsersInRoom(roomName) {
	const inRoomQuery = `room:${roomName}:inRoom`;
	return await redisClient.smembers(inRoomQuery);
}

async function removeInRoom(roomName, characterId) {
	const inRoomQuery = `room:${roomName}:inRoom`;
	return await redisClient.srem(inRoomQuery, characterId);
}

/* This is should only be used on init, so we just issue the command and away
   it goes. */
function clearInRoom(roomName) {
	const inRoomQuery = `room:${roomName}:inRoom`;
	return redisClient.del(inRoomQuery);
}

async function checkInRoom(roomName, characterId) {
	const inRoomQuery = `room:${roomName}:inRoom`;
	return await redisClient.sismember(inRoomQuery, characterId);
}

async function isPasswordNeeded(roomName) {
	const roomQuery = `room:${roomName}`;
	const roomPassword = await redisClient.hget(roomQuery, "password");
	return roomPassword.length > 0;
}

async function VerifyPassword(roomName, password) {
	const roomQuery = `room:${roomName}`;
	const roomPassword = await redisClient.hget(roomQuery, "password");
	return roomPassword == password;
}

/*****************************************************************************/
async function setMods(roomName, modsData) { }

async function addMod(roomName, characterId) {
	const modsQuery = `room:${roomName}:mods`;
	return await redisClient.sadd(modsQuery, characterId);
}

async function isMod(roomName, characterId) {
	const modsQuery = `room:${roomName}:mods`;
	logger.debug(`isMod query: ${modsQuery}, ${characterId}`);
	return (await redisClient.sismember(modsQuery, characterId)) == 1;
}

async function isOwner(roomName, characterId) {
	const roomQuery = `room:${roomName}`;
	const roomData = await redisClient.hgetall(roomQuery);

	return roomData.owner == characterId;
}

async function removeMod(roomName, characterId) {
	const modsQuery = `room:${roomName}:mods`;
	return await redisClient.srem(modsQuery, characterId);
}

async function switchOwner(roomName, targetId) {
	const roomQuery = `room:${roomName}`;
	await redisClient.hset(roomQuery, { owner: targetId });
}

async function addBanned(roomName, characterId) {
	const bannedQuery = `room:${roomName}:banned`;
	return await redisClient.sadd(bannedQuery, characterId);
}

async function removeBanned(roomName, characterId) {
	const bannedQuery = `room:${roomName}:banned`;
	return await redisClient.srem(bannedQuery, characterId);
}

async function checkIfBanned(roomName, characterId) {
	const bannedQuery = `room:${roomName}:banned`;
	return await redisClient.sismember(bannedQuery, characterId);
}

/*****************************************************************************/
async function pushRoomLog(roomName, messageData) {
	const logQuery = `room:${roomName}:chatlog`;
	const numMessages = await redisClient.llen(logQuery);

	if (numMessages >= MAX_CHAT_MSGS) {
		await redisClient.lpop(logQuery);
	}
	return await redisClient.rpush(logQuery, JSON.stringify(messageData));
}

async function getRoomLog(roomName) {
	const logQuery = `room:${roomName}:chatlog`;
	let chatlog = await redisClient.lrange(logQuery, 0, MAX_CHAT_MSGS);
	for (let i = 0; i < chatlog.length; i++) {
		chatlog[i] = JSON.parse(chatlog[i]);
	}
	return chatlog;
}

module.exports = {
	loadModule,

	/* Functions for general room information */
	createRoom,
	getPublicRoomNames,
	checkRoomExists,
	removeRoom,

	/* Functions for settings about the room */
	getRoomData,
	setDescription,
	setPassword,
	setPrivate,

	/* Functions for joining, leaving, and checking access to room*/
	addInRoom,
	getUsersInRoom,
	removeInRoom,
	clearInRoom,
	checkInRoom,
	isPasswordNeeded,
	VerifyPassword,

	/* Functions for modding */
	setMods,
	addMod,
	removeMod,
	switchOwner,
	isMod,
	isOwner,
	addBanned,
	removeBanned,
	checkIfBanned,

	pushRoomLog,
	getRoomLog,
};
