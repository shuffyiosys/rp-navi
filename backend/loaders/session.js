const expressSession = require("express-session");
const cookieParser = require("cookie-parser");

const { logger, formatJson } = require("../utils/logger");

function setupMemorySession(app, serverConfig) {
	logger.info(`Using in-memory sessioning`);
	return createSessionStore(app, serverConfig);
}

function setupMongoSession(app, serverConfig, mongoDbConfig) {
	const MongoStore = require("connect-mongo");
	logger.info(`Using MongoStore sessioning`);

	return createSessionStore(
		app,
		serverConfig,
		MongoStore.create({
			mongoUrl: mongoDbConfig.url,
		})
	);
}

function setupRedisSession(app, serverConfig, redisClient) {
	const connectRedis = require("connect-redis");
	const redisStore = connectRedis(expressSession);
	logger.info(`Using Redis sessioning`);
	return createSessionStore(app, serverConfig, new redisStore({ client: redisClient }));
}

function createSessionStore(app, serverConfig, store = null) {
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
			sameSite: "strict",
		},
	};

	logger.debug(`Configuring session with the following parameters: ${formatJson(sessionParams)}`);
	sessionParams.store = store;
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
