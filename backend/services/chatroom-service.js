const { logger, formatJson } = require("../utils/logger");
const crypto = require("../utils/crypto");

function warnFailedInit() {
	var path = require("path");
	var scriptName = path.basename(__filename);
	logger.warn(`[${scriptName}] Redis client hasn't been initialized!`);
}

let redisClient = {
	exists: warnFailedInit,
	hmset: warnFailedInit,
	hset: warnFailedInit,
	hget: warnFailedInit,
	hgetall: warnFailedInit,

	smembers: warnFailedInit,
	scard: warnFailedInit,
	sismember: warnFailedInit,
	sadd: warnFailedInit,
	srem: warnFailedInit,

	llen: warnFailedInit,
	lrange: warnFailedInit,
	rpush: warnFailedInit,
	del: warnFailedInit,
};

function loadModule(redisConnection) {
	redisClient = redisConnection;

	getPublicRoomNames().then((rooms) => {
		rooms.forEach((room) => {
			clearInRoom(room);
		});
	});
}

/*****************************************************************************/
async function createRoom(roomName, ownerId, description = "", isPrivate = false, password = "") {
	const roomQuery = `room:${roomName}`;
	const data = {
		name: roomName,
		description: description,
		owner: ownerId,
		private: isPrivate.toString(),
		password: password,
	};

	if (password) {
		const salt = await crypto.generateKey();
		const hash = await crypto.getPasswordHash(password, salt);
		data.password = hash;
	}
	if (isPrivate == false) {
		await redisClient.sadd("publicRoomNames", roomName);
	}
	await redisClient.sadd("roomNames", roomName);
	return await redisClient.hset(roomQuery, data);
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
	logger.info(`Room Data Request = ${formatJson(roomData)}, ${modRequest}`);

	if (roomData === null) {
		return roomData;
	} else if (modRequest == true) {
		const inRoom = await redisClient.smembers(`room:${roomName}:inRoom`);
		const mods = await redisClient.smembers(`room:${roomName}:mods`);
		const banned = await redisClient.smembers(`room:${roomName}:banned`);

		if (roomData.password.length > 0) {
			roomData.password = true;
		} else {
			roomData.password = false;
		}
		if (inRoom) {
			roomData.inRoom = inRoom;
		}
		if (mods) {
			roomData.mods = mods;
		}
		if (banned) {
			roomData.banned = banned;
		}
	} else {
		delete roomData.owner;
		delete roomData.private;
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

async function verifyRoomPassword(roomName, password) {
	const roomQuery = `room:${roomName}`;
	const roomPassword = await redisClient.hget(roomQuery, "password");
	return await crypto.verifyPassword(roomPassword, password);
}

/*****************************************************************************/
async function setMods(roomName, modsData) {}

async function addMod(roomName, characterId) {
	const modsQuery = `room:${roomName}:mods`;
	return await redisClient.sadd(modsQuery, characterId);
}

async function isMod(roomName, characterId) {
	const modsQuery = `room:${roomName}:mods`;
	return await redisClient.sismember(modsQuery, characterId);
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

async function setBanned(roomName, bannedData) {}

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

/*****************************************************************************/
async function checkUserCharacters(userId) {
	return await redisClient.scard(`user:${userId}`);
}

async function addUserCharacters(userId, characters) {
	if (Array.isArray(characters) == false) {
		return 0;
	}

	let characterIds = [];
	characters.forEach((character) => characterIds.push(character.charaName));
	let result = await redisClient.sadd(`user:${userId}`, characterIds);

	// Using this as a cache, so let this expire after some time.
	const EXPIRY_TIME = 48 * 60 * 60; // 48 hours in seconds
	redisClient.expire(`user:${userId}`, EXPIRY_TIME);

	return result;
}

async function verifyUserOwnsCharacter(userId, characterId) {
	return await redisClient.sismember(`user:${userId}`, characterId);
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
	removeInRoom,
	clearInRoom,
	checkInRoom,
	isPasswordNeeded,
	verifyRoomPassword,

	/* Functions for modding */
	setMods,
	addMod,
	removeMod,
	switchOwner,
	isMod,
	isOwner,
	setBanned,
	addBanned,
	removeBanned,
	checkIfBanned,

	pushRoomLog,
	getRoomLog,

	checkUserCharacters,
	addUserCharacters,
	verifyUserOwnsCharacter,
};
