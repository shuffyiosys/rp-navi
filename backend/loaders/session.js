const expressSession = require("express-session");
const cookieParser = require("cookie-parser");

const { logger, formatJson } = require("../utils/logger");

function setupMemorySession(app, serverConfig) {
	logger.info(`Using in-memory sessioning`);

	let sessionParams = {
		name: serverConfig.SESSION_NAME,
		secret: serverConfig.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: parseInt(serverConfig.SESSION_TTL),
			secure: false,
			httpOnly: false,
		},
	};

	return applySession(app, sessionParams);
}

function setupMongoSession(app, serverConfig, mongoDbConfig) {
	const MongoStore = require("connect-mongo");
	logger.info(`Using MongoStore sessioning`);

	let sessionParams = {
		name: serverConfig.SESSION_NAME,
		secret: serverConfig.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: parseInt(serverConfig.SESSION_TTL),
			secure: false,
			httpOnly: false,
			secret: serverConfig.SESSION_COOKIE_SECRET,
		},
		store: MongoStore.create({
			mongoUrl: mongoDbConfig.url,
		}),
	};

	return applySession(app, sessionParams);
}

function setupRedisSession(app, serverConfig, redisClient) {
	const connectRedis = require("connect-redis");
	const redisStore = connectRedis(expressSession);
	logger.info(`Using Redis sessioning`);

	let sessionParams = {
		name: serverConfig.SESSION_NAME,
		secret: serverConfig.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: parseInt(serverConfig.SESSION_TTL),
			secure: false,
			httpOnly: false,
			secret: serverConfig.SESSION_COOKIE_SECRET,
		},
		store: new redisStore({ client: redisClient }),
	};

	return applySession(app, sessionParams);
}

function applySession(app, sessionParams) {
	logger.debug(`Configuring session with the following parameters: ${formatJson(sessionParams.cookie, false)}`);
	const session = expressSession(sessionParams);
	app.use(session);
	app.use(cookieParser(sessionParams.cookie.secret));
	return session;
}

module.exports = {
	setupMemorySession,
	setupMongoSession,
	setupRedisSession,
};
