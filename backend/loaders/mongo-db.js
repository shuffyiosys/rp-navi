/**
 * @file Handles connecting to, disconnecting, and basic statusing of a MongoDB
 * 			server.
 */
const { logger } = require("../utils/logger");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/**
 * Sets up a MongoDB connection.
 * @param {Object} dbParameters - Contains the database connection parameters
 * 		<br>database. Connection requires the following data members
 * 		<br>ipAddress: IP address or URL to the database
 * 		<br>portNumber: Port that the DB is listening to
 * 		<br>dbName: Name of the database to use
 * 		<br>username: Username that the database uses to authenticate the
 * 		    connection
 * 		<br>password: Password that the database uses to authenticate the
 * 		    connection
 * @param {String[]} schemaFiles - Array of strings containing the paths to the
 * 		schema files.
 */
async function setup(dbParameters) {
	mongoose.Promise = global.Promise;
	const MONGO_DB_URI = `mongodb://${dbParameters.MONGO_DB_IP}:${dbParameters.MONGO_DB_PORT}`;

	let mongooseOptions = {
		dbName: dbParameters.MONGO_DB_NAME,
		user: dbParameters.MONGO_DB_USERNAME,
		pass: dbParameters.MONGO_DB_PASSWORD,
	};
	mongoose.set("strictQuery", false);

	if (dbParameters.MONGO_DB_USERNAME.length > 0 && dbParameters.MONGO_DB_PASSWORD.length > 0) {
		mongooseOptions.authSource = "admin";
	}

	logger.info(`[MongoDB] Attempting to connect to ${MONGO_DB_URI}`);
	logger.debug("[MongoDB] Connecting using options %o", mongooseOptions);

	mongoose.connection
		.once("open", () => {
			logger.info(`[MongoDB] Connected to ${MONGO_DB_URI}`);
		})
		.on("error", (error) => {
			logger.error("[MongoDB] Connection error : ", error);
		})
		.on("disconnected", () => {
			logger.info("[MongDB] Server disconneceted from database.");
		});

	await mongoose.connect(MONGO_DB_URI, mongooseOptions).catch((err) => {
		logger.error(err);
	});

	return mongoose;
}

/**
 * Reisters the database schemas with mongoose
 * @param {String} modelPath Path where the schema files are located.
 */
function initModels(modelPath = "") {
	if (modelPath == "") {
		modelPath = path.join(__dirname, "..", "models");
	}
	const files = fs.readdirSync(modelPath);
	files.forEach((file) => {
		const filepath = path.join(modelPath, file);
		try {
			require(filepath);
		} catch (e) {
			logger.error(`Error in loading model file ${filepath}: ${e}`);
		}
	});
}

module.exports = {
	setup,
	initModels,
};
