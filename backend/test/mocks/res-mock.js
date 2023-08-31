const { logger, formatJson } = require("../../utils/logger");

class ResponseMock {
	constructor() {
		this.locals = {};
		this.jsonData = {};
	}

	json(jsonObj) {
		this.jsonData = jsonObj;
	}

	redirect(redirectUrl) {
		logger.info(`Redirecting to ${redirectUrl}`);
	}

	render(pagePath, data) {
		logger.info(`Rendering page ${pagePath} with data ${formatJson(data)}`);
	}

	status(statusCode) {
		logger.info(`Responding with HTML code ${statusCode}`);
	}
}

module.exports = {
	ResponseMock,
};
