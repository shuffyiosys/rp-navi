/**
 * @file Main app configuration.
 */

/* Setup environment ********************************************************/
const config = require("../config/config")();
const { logger, formatJson } = require("../utils/logger");
logger.debug(`Config: ${formatJson(config)}`);

/* Setup DB ******************************************************************/
require("../loaders/mongo-db").setup(config.database.mongo);
require("../loaders/mongo-db").initModels();

/** Tests to run. Comment out whatever isn't needed. */
require("./services/account-service-test")();
