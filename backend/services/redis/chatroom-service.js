const { logger, formatJson } = require("../../utils/logger");
const { redisClient } = require("../../loaders/redis-db");

const MAX_CHAT_MSGS = 30;

/*****************************************************************************/
async function createRoom(data) {
	let newRoom = {
		roomName: data.roomName,
		owner: data.characterName,
		isPrivate: data.isPrivate ? "true" : "false",
		description: data.description || "",
		password: data.password || "",
	};

	logger.debug(`Creating room "room:${data.roomName}|${formatJson(newRoom, false)}"`);
	const result = await redisClient.HSET(`room:${data.roomName}`, newRoom);

	if (!data.isPrivate && result > 0) {
		await redisClient.SADD("publicRoomNames", data.roomName);
	}
	return result;
}

async function removeRoom(roomName) {
	const extraEntries = ["inRoom", "mods", "banned", "chatlog"];

	const roomQuery = `room:${roomName}`;
	redisClient.DEL(roomQuery);

	extraEntries.forEach(function (entry) {
		redisClient.DEL(`${roomQuery}:${entry}`);
	});
	redisClient.SREM("publicRoomNames", roomName);
}

async function getPublicRoomNames() {
	logger.debug("Getting public rooms");
	return await redisClient.SMEMBERS("publicRoomNames");
}

async function checkRoomExists(roomName) {
	return (await redisClient.EXISTS(`room:${roomName}`)) == 1;
}

/*****************************************************************************/
async function getData(roomName, modRequest = false) {
	const roomQuery = `room:${roomName}`;
	let roomData = await redisClient.HGETALL(roomQuery);

	if (Object.keys(roomData).length === 0) {
		return roomData;
	}

	roomData.mods = await redisClient.SMEMBERS(`room:${roomName}:mods`);
	roomData.users = await redisClient.SMEMBERS(`room:${roomName}:inRoom`);

	if (modRequest) {
		const banned = await redisClient.SMEMBERS(`room:${roomName}:banned`);
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

async function updateOptions({ roomName, roomOptions }) {
	const roomQuery = `room:${roomName}`;
	return await redisClient.HMSET(roomQuery, roomOptions);
}

/******************************************************************************
 * Handles all "inRoom" sub-subkeys
 */
/**
 *
 * @param {*} roomName
 * @param {*} characterName
 * @returns
 */
async function addInRoom(roomName, characterName) {
	return await redisClient.SADD(`room:${roomName}:inRoom`, characterName);
}

async function getInRoom(roomName) {
	return await redisClient.SMEMBERS(`room:${roomName}:inRoom`);
}

async function removeInRoom(roomName, characterName) {
	logger.debug(`Removing ${characterName} in ${roomName}`);
	return await redisClient.SREM(`room:${roomName}:inRoom`, characterName);
}

/* This is should only be used on init, so we just issue the command and away
   it goes. */
function clearInRoom(roomName) {
	return redisClient.DEL(`room:${roomName}:inRoom`);
}

async function checkInRoom(roomName, characterName) {
	return (await redisClient.SISMEMBER(`room:${roomName}:inRoom`, characterName)) == 1;
}

/******************************************************************************
 *
 */
async function isPassworded(roomName) {
	const roomPassword = await redisClient.hget(`room:${roomName}`, "password");
	return roomPassword.length > 0;
}

async function verifyPassword(roomName, password) {
	return (await redisClient.hget(`room:${roomName}`, "password")) == password;
}

/*****************************************************************************/
async function addMod(roomName, characterName) {
	const modsQuery = `room:${roomName}:mods`;
	return await redisClient.SADD(modsQuery, characterName);
}

async function isMod(roomName, characterName) {
	return (await redisClient.SISMEMBER(`room:${roomName}:mods`, characterName)) == 1;
}

async function removeMod(roomName, characterName) {
	return await redisClient.SREM(`room:${roomName}:mods`, characterName);
}

async function isOwner(roomName, characterName) {
	return (await redisClient.HGET(`room:${roomName}`, "owner")) == characterName;
}

async function switchOwner(roomName, ownerName) {
	await redisClient.HSET(`room:${roomName}`, "owner", ownerName);
}

async function addBanned(roomName, characterName) {
	return await redisClient.SADD(`room:${roomName}:banned`, characterName);
}

async function removeBanned(roomName, characterName) {
	return await redisClient.SREM(`room:${roomName}:banned`, characterName);
}

async function isBanned(roomName, characterName) {
	return (await redisClient.SISMEMBER(`room:${roomName}:banned`, characterName)) == 1;
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
	/* Functions for general room information */
	createRoom,
	getPublicRoomNames,
	checkRoomExists,
	removeRoom,

	/* Functions for settings about the room */
	getData,
	updateOptions,

	/* Functions for joining, leaving, and checking access to room*/
	addInRoom,
	getInRoom,
	removeInRoom,
	clearInRoom,
	checkInRoom,
	isPassworded,
	verifyPassword,

	/* Functions for modding */
	addMod,
	removeMod,
	switchOwner,
	isMod,
	isOwner,
	addBanned,
	removeBanned,
	isBanned,

	pushRoomLog,
	getRoomLog,
};
