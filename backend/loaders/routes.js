const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

function load(app) {
	const staticRoutesPath = path.join(__dirname, '..', 'routes');
	const files = fs.readdirSync(staticRoutesPath);
	files.forEach(file => {
		const filepath = path.join(staticRoutesPath, file);
		const router = require(filepath);
		
		logger.debug(`Loading route ${router.basepath} from ${filepath}`);
		app.use(`${router.basepath}`, router.router);
	})
}

module.exports = load;