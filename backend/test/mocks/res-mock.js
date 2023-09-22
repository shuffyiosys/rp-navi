const { logger, formatJson } = require("../../utils/logger");

class ResponseMock {
	constructor() {
		this.locals = {};
		this.jsonData = {};
		this.statusCode = 0;
		this.pagePath = "";
	}

	json(jsonObj) {
		this.jsonData = jsonObj;
	}

	redirect(redirectUrl) {
		logger.info(`Redirecting to ${redirectUrl}`);
		this.statusCode = 200;
	}

	render(pagePath, data) {
		logger.info(`Rendering page ${pagePath} with data ${formatJson(data)}`);
		this.pagePath = pagePath;
	}

	status(statusCode) {
		logger.info(`Responding with HTML code ${statusCode}`);
		this.statusCode = statusCode;
	}
}

module.exports = {
	ResponseMock,
};
