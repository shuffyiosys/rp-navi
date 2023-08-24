const { logger } = require("../../utils/logger");

class RequestMock {
	constructor(body = {}, query = {}, session = {}) {
		this.body = body;
		this.query = query;
		this.session = {
			save: function () {
				logger.info("Saving session");
			},
			destroy: function () {
				logger.info("Destroying session");
			},
		};
		Object.assign(this.session, session);
	}
}

module.exports = {
	RequestMock,
};
