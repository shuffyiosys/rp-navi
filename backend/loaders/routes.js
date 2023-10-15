const fs = require("fs");
const path = require("path");
const { logger } = require("../utils/logger");

function load(app) {
	const staticRoutesPath = path.join(__dirname, "..", "routes");
	const files = fs.readdirSync(staticRoutesPath);
	files.forEach((file) => {
		const filepath = path.join(staticRoutesPath, file);
		const router = require(filepath);

		try {
			logger.info(`Loading route ${router.basepath} from ${filepath}`);
			app.use(`${router.basepath}`, router.router);
		} catch (e) {
			logger.error(`Error in using route file ${filepath}: ${e}`);
		}
	});
}

module.exports = load;
