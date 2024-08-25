
const path = require("path");

function getConfig() {
	const envPath = path.join(`${__dirname}`);
	require('dotenv-flow').config({
		path: envPath,
		silent: true
	});
	return process.env;
}

module.exports = getConfig;
