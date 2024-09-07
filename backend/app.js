/**
 * @file Main app configuration.
 */
const path = require("path");

/* Setup environment ********************************************************/
async function setupApp() {
	const config = require("./config/config")();
	const { logger } = require("./utils/logger"); // Order matters because logger needs the ENVs!

	logger.info(`RP Navi server is running in the **${process.env.NODE_ENV}** environment`);
	logger.info(`Logger level: ${logger.level}`);

	/* Connect to DBs and check to make sure they're connected ***************/
	const MongoDB = require("./loaders/mongo-db");
	const mongoDbClient = await MongoDB.setup(config);
	logger.info(`Mongo DB connection state: ${mongoDbClient.connection.readyState}`);
	if (mongoDbClient.connection.readyState != 1) {
		logger.warn(`Could not connect to the MongoDB server, exiting.`);
		process.exit(0);
	}

	const RedisDB = require("./loaders/redis-db");
	await RedisDB.connectToServer(config);
	let redisPonged = await RedisDB.pingServer();
	logger.info(`Redis connection successful: ${redisPonged}`);
	if (!redisPonged) {
		logger.warn(`Could not connect to the Redis server, exiting.`);
		process.exit(0);
	}
	const redisClient = RedisDB.redisClient;

	MongoDB.initModels();

	/* Create Express Instance ***********************************************/
	const express = require("express");
	let app = express();

	/* Load and setup security packages **************************************/
	// require("./loaders/security")(app, config);

	/* Load and setup server middleware **************************************/
	const clientPaths = {
		views: path.join(__dirname, "../client/views"),
		public: path.join(__dirname, "../client/public"),
	};
	require("./loaders/server-middleware")(app, clientPaths);

	/* Setup sessioning ******************************************************/
	let sessionParams;
	if (redisClient) {
		sessionParams = require("./loaders/session").setupRedisSession(app, config, redisClient);
	} else {
		sessionParams = require("./loaders/session").setupMemorySession(app, config);
	}

	/* Setup Routes **********************************************************/
	require("./loaders/routes")(app);

	/* Initialize other modules */
	require("./services/redis/chatroom-service").loadModule();

	/** Create and launch the server *****************************************/
	let servers = { httpServer: null, httpsServer: null };
	servers = await require("./loaders/server").createServers(app, config);

	/** Startup Socket.IO servers */
	let socketIoServer = require("./loaders/socket-io")(servers.httpServer, redisClient);
	socketIoServer.engine.use(sessionParams);

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
