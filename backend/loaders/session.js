const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const connectRedis = require('connect-redis');
const redisStore = connectRedis(expressSession);

const {
	startClient,
	connectionExists,
	getClient
} = require('../loaders/redis-db');

const {
	logger,
	formatJson
} = require('../utils/logger');

function startRedisSession(app, sessionConfig, storeConfig, ttl=300) {
	logger.info(`Using Redis sessioning`);
	
	if(connectionExists('Session') === false) {
		startClient(storeConfig, 'Session');
	}
	const client = getClient('Session');
	sessionConfig.store = new redisStore({
		host: storeConfig.url,
		port: storeConfig.port,
		client: client,
		ttl: ttl
	})

	app.use(expressSession(sessionConfig));
}

function startMemorySession(app, sessionConfig) {
	logger.info(`Using in-memory sessioning`);
	app.use(expressSession(sessionConfig));
}

function load(app, config) {
	const sessionConfig = config.session;
	let sessionParams = {
		name: sessionConfig.name,
		secret: sessionConfig.secret,
		resave: false,
		cookie: {
			maxAge: parseInt(sessionConfig.ttl),
			secure: false,
		},
		saveUninitialized: true
	};

	if (sessionConfig.type === 'db') {
		startRedisSession(app, sessionParams, config.database, sessionConfig.ttl);
		app.use(cookieParser(config.cookieSecret));
	} else {
		startMemorySession(app, sessionParams);
	}
}

module.exports = load;