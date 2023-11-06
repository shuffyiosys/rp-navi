/**
 * @file Main app configuration.
 */
const path = require("path");

/* Setup environment ********************************************************/
async function setupApp() {
	const config = require("./config/config")();
	const { logger, formatJson } = require("./utils/logger");
	logger.debug(`Config: ${formatJson(config)}`);

	/* Connect to DBs and check to make sure they're connected ***************/
	const MongoDB = require("./loaders/mongo-db");
	const mongoDbClient = await MongoDB.setup(config.database.mongo);
	logger.info(`Mongo DB connection state: ${mongoDbClient.connection.readyState}`);
	if (mongoDbClient.connection.readyState != 1) {
		logger.warn(`Could not connect to the MongoDB server, exiting.`);
		process.exit(0);
	}

	const RedisDB = require("./loaders/redis-db");
	const redisClient = await RedisDB.connectToServer(null);
	logger.info(`Checking Redis connection via pinging...`);
	if ((await redisClient.ping()) != "PONG") {
		logger.warn(`Could not connect to the Redis server, exiting.`);
		process.exit(0);
	}

	MongoDB.initModels();

	/* Create Express Instance ***********************************************/
	const express = require("express");
	let app = express();

	/* Load and setup security packages **************************************/
	require("./loaders/security")(app, config);

	/* Load and setup server middleware **************************************/
	const clientPaths = {
		views: path.join(__dirname, "../client/views"),
		public: path.join(__dirname, "../client/public"),
	};
	require("./loaders/server-middleware")(app, clientPaths);

	/* Setup sessioning ******************************************************/
	let sessionParams;
	// if (redisClient) {
	// 	sessionParams = require("./loaders/session").setupRedisSession(app, config.session, redisClient);
	// } else {
	sessionParams = require("./loaders/session").setupMemorySession(app, config.session);
	// }

	/* Setup Routes **********************************************************/
	require("./loaders/routes")(app);

	/** Create and launch the server *****************************************/
	let servers = { httpServer: null, httpsServer: null };
	servers = await require("./loaders/server").createServers(app, config);

	/** Startup Socket.IO servers */
	let socketIoServer = require("./sockets/socket-io")(servers.httpServer);
	// socketIoServer.engine.use(sessionParams);

	/** Start servers ********************************************************/
	/** Start the HTTPS server if it was created, otherwise start the HTTP
	 *  server. The HTTPS server starts an HTTP redirect one.
	 */
	if (servers.httpsServer != null) {
		require("./loaders/server").startServers(servers, config, "https");
	} else {
		require("./loaders/server").startServers(servers, config);
	}

	async function cleanup() {
		console.log("");
		logger.info(`Shutting down Socket.IO server`);
		socketIoServer.close();

		logger.info(`Shutting down HTTP server`);
		(await servers).httpServer.close();

		if ((await servers).httpsServer != null) {
			logger.info(`Shutting down HTTPS server`);
			(await servers).httpsServer.close();
		}

		logger.info(`Closing Mongoose DB connection`);
		await mongoDbClient.connection.close();
		logger.info(`Closing Redis connection`);
		await redisClient.quit();
		process.exit(0);
	}

	process.on("SIGTERM", () => cleanup);
	process.on("SIGINT", cleanup);
}

setupApp();
