/**
 * @file room-data-class
 * @description
 *	Contains the parameters for accessing room data from the Redis data store.
 *	This class should contain no actual data for the room itself aside from the
 *	necessary queries to get it from the Redis store.
 *
 *	For class functions, if it is meant to set something in the Redis store,
 *	it should return the result of the operation or 0. If it's meant to get
 *	something, it should return an object or null
 */
const MAX_CHAT_MSGS = 30;

class ChatroomData {
	constructor(roomName, redisClient) {
		this.roomName = roomName;
		this.roomQuery = `room:${roomName}`;
		this.inRoomQuery = `room:${roomName}:inRoom`;
		this.modsQuery = `room:${roomName}:mods`;
		this.bannedQuery = `room:${roomName}:banned`;
		this.logQuery = `room:${roomName}:chatlog`;

		this.redis = redisClient;
	}

	async createRoom(ownerId, description = "", isPrivate = false, password = "") {
		if ((await this.redis.exists(this.roomQuery)) === 0) {
			const data = {
				name: this.roomName,
				description: description,
				owner: ownerId,
				private: isPrivate.toString(),
				password: password,
			};
			return await this.redis.hmset(this.roomQuery, data);
		}
		return 0;
	}

	async getRoomData(publicRequest = true) {
		let roomData = await this.redis.hgetall(this.roomQuery);

		if (roomData !== null) {
			roomData.private = roomData.private === "true" ? true : false;
			const inRoom = await this.redis.smembers(this.inRoomQuery);
			const mods = await this.redis.smembers(this.modsQuery);
			const banned = await this.redis.smembers(this.bannedQuery);

			if (inRoom) {
				roomData.inRoom = new Set(inRoom);
			}
			if (mods) {
				roomData.mods = new Set(mods);
			}
			if (banned) {
				roomData.banned = new Set(banned);
			}

			if (publicRequest === true) {
				delete roomData.password;
				delete roomData.banned;

				if (roomData.private === true) {
					delete roomData.inRoom;
					delete roomData.mods;
				}
			}
		}

		return roomData;
	}

	async setDescription(description) {
		return await this.redis.hmset(this.roomQuery, { description: description });
	}

	async setPassword(password) {
		return await this.redis.hmset(this.roomQuery, { password: password });
	}

	async setPrivate(privacy) {
		return await this.redis.hmset(this.roomQuery, { private: privacy.toString() });
	}

	async setInRoom(inRoomData) {
		const inRoom = Array.from(inRoomData);
		if (inRoom.length > 0) {
			return await this.redis.sadd(this.inRoomQuery, inRoom);
		} else {
			return 0;
		}
	}

	async addInRoom(characterId) {
		return await this.redis.sadd(this.inRoomQuery, characterId);
	}

	async removeInRoom(characterId) {
		return await this.redis.srem(this.inRoomQuery, characterId);
	}

	async setMods(modsData) {
		const mods = Array.from(modsData);
		if (mods.length > 0) {
			return await this.redis.sadd(this.modsQuery, mods);
		} else {
			return 0;
		}
	}

	async addMod(characterId) {
		return await this.redis.sadd(this.modsQuery, characterId);
	}

	async removeMod(characterId) {
		return await this.redis.srem(this.modsQuery, characterId);
	}

	async setBanned(bannedData) {
		const banned = Array.from(bannedData);
		if (banned.length > 0) {
			return await this.redis.sadd(this.bannedQuery, banned);
		} else {
			return 0;
		}
	}

	async addBanned(characterId) {
		return await this.redis.sadd(this.bannedQuery, characterId);
	}

	async removeBanned(characterId) {
		return await this.redis.srem(this.bannedQuery, characterId);
	}

	async pushRoomLog(messageData) {
		const numMessages = await this.redis.llen(this.logQuery);

		if (numMessages >= MAX_CHAT_MSGS) {
			await this.redis.lpop(this.logQuery);
		}
		return await this.redis.rpush(this.logQuery, JSON.stringify(messageData));
	}

	async getRoomLog() {
		let chatlog = await this.redis.lrange(this.logQuery, 0, MAX_CHAT_MSGS);
		for (let i = 0; i < chatlog.length; i++) {
			chatlog[i] = JSON.parse(chatlog[i]);
		}
		return chatlog;
	}

	async removeRoom() {
		let deletedData = {};
		deletedData.room = await this.redis.del(this.roomQuery);
		deletedData.inRoom = await this.redis.del(this.inRoomQuery);
		deletedData.mods = await this.redis.del(this.modsQuery);
		deletedData.banned = await this.redis.del(this.bannedQuery);
		deletedData.logs = await this.redis.del(this.logQuery);

		return deletedData;
	}
}

module.exports = {
	ChatroomData,
};
