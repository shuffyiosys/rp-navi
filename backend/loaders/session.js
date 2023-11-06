const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectRedis = require("connect-redis");
const redisStore = connectRedis(expressSession);

const { logger, formatJson } = require("../utils/logger");

function setupMemorySession(app, sessionConfig) {
	let sessionParams = {
		name: sessionConfig.name,
		secret: sessionConfig.secret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: parseInt(sessionConfig.ttl),
			secure: false,
			httpOnly: false,
		},
	};

	logger.debug(`Session configuration: ${formatJson(sessionConfig)}`);
	logger.info(`Using in-memory sessioning`);
	app.use(expressSession(sessionParams));
}

function setupRedisSession(app, sessionConfig, redisClient) {
	let sessionParams = {
		name: sessionConfig.name,
		secret: sessionConfig.secret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: parseInt(sessionConfig.ttl),
			secure: false,
			httpOnly: false,
		},
	};

	logger.debug(`Session configuration: ${formatJson(sessionConfig)}`);
	logger.info(`Using Redis sessioning`);
	sessionParams.store = new redisStore({ client: redisClient });
	app.use(expressSession(sessionParams));
	app.use(cookieParser(sessionConfig.cookieSecret));
}

module.exports = {
	setupMemorySession,
	setupRedisSession,
};
