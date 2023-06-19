/**
 * @file Main app configuration.
 */
const path = require('path');

/* Setup environment ********************************************************/
const config = require('./config/config')();
const { logger, formatJson } = require('./utils/logger');
logger.debug(`Config: ${formatJson(config)}`);

/* Setup DB ******************************************************************/
require('./loaders/mongo-db').setup(config.database.mongo);
require('./loaders/mongo-db').initModels();

/* Create Express Instance ***************************************************/
const express = require('express');
let app = express();

/* Load and setup security packages ******************************************/
require('./loaders/security')(app, config);

/* Load and setup server middleware ******************************************/
const clientPaths = { 
	views: path.join(__dirname, '../client/views'),
	public: path.join(__dirname, '../client/public')
};
require('./loaders/server-middleware')(app, clientPaths);

/* Load and setup sessioning *************************************************/
require('./loaders/session')(app, config);

/* Setup Routes **************************************************************/
require('./loaders/routes')(app);

/** Create and launch the server *********************************************/
require('./loaders/server')(app, config);

const closeMongoConnection = require('./loaders/mongo-db').closeConnection;
const closeRedisConnection = require('./loaders/redis-db').closeConnections;

process.on('SIGINT', () => {
	logger.info(`Shutting down server`)
	closeMongoConnection()
	.then((() => {
		logger.info(`Mongoose DB connection closed`);
		return closeRedisConnection();
	}))
	.then(() => {
		logger.info(`Redis connections closed`);
		process.exit(0);
	})
})