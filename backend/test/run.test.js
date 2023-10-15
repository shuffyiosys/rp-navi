/** Import dependencies and environment */
const fs = require("fs");
const path = require("path");
const { logger, formatJson } = require("../utils/logger");

const filepath = path.join(__dirname + "/../config/.env.test.local");
if (fs.existsSync(filepath) === false) {
	logger.error(`File ${filepath} missing, this is needed for running tests. Aborting test.`);
	process.exit(0);
}

const config = require("../config/config")(".env.test.local");
const expect = require("chai").expect;

logger.info(`Config: ${formatJson(config)}`);

/** Setup Mongoose to connect to MongoDB and the models **********************/
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const dbParameters = config.database.mongo;
before(function () {
	const MONGO_DB_URI = `mongodb://${dbParameters.url}:${dbParameters.port}`;
	let mongooseOptions = {
		dbName: dbParameters.name,
		user: dbParameters.username,
		pass: dbParameters.password,
	};
	mongoose.set("strictQuery", false);

	if (dbParameters.username && dbParameters.password) {
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
	return mongoose.connect(MONGO_DB_URI, mongooseOptions).catch((err) => {
		logger.error(err);
	});
});

require("../loaders/mongo-db").initModels();

/** Test cases ***************************************************************/
describe("Sanity check", function () {
	describe("#indexOf()", function () {
		it("should return -1 when the value is not present", function () {
			expect([1, 2, 3].indexOf(4)).to.equal(-1);
		});
	});
});

describe("RP Navi Controller Test", function () {
	// describe("Accounts", () => require("./controllers/account-controller.test").runTest());
	//describe("Characters", () => require("./controllers/character-controller.test").runTest());
	require("./socket-io/sanity.test").runTest();
});

/** Cleanup things so the testing framework can exit *************************/
after(async function () {
	logger.info(`Closing MonogoDB connection...`);
	return mongoose.connection.close();
});
