const { logger, formatJson } = require("../utils/logger");
const { SocketIoResponse } = require("../classes/socket-io-response");

const chatService = require("../services/redis/chatroom-service");
const characterService = require("../services/redis/character-service");

async function setupSocket(io, socket) {}
