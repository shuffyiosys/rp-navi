const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectRedis = require("connect-redis");
const redisStore = connectRedis(expressSession);

const { logger, formatJson } = require("../utils/logger");

function setupMemorySession(app, sessionConfig) {
	logger.info(`Using in-memory sessioning`);

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

	return applySession(app, sessionParams);
}

function setupRedisSession(app, sessionConfig, redisClient) {
	logger.info(`Using Redis sessioning`);

	let sessionParams = {
		name: sessionConfig.name,
		secret: sessionConfig.secret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: parseInt(sessionConfig.ttl),
			secure: false,
			httpOnly: false,
			secret: sessionConfig.cookieSecret,
		},
		store: new redisStore({ client: redisClient }),
	};

	return applySession(app, sessionParams);
}

function applySession(app, sessionParams) {
	logger.debug(`Session configuration: ${formatJson(sessionParams)}`);
	const session = expressSession(sessionParams);
	app.use(session);
	app.use(cookieParser(sessionParams.cookie.secret));
	return session;
}

module.exports = {
	setupMemorySession,
	setupRedisSession,
};
