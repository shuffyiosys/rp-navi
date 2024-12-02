/**
 * @file
 */
class AjaxResponse {
	constructor(success = false, msg = "", data = {}) {
		this.success = success;
		this.msg = msg;
		this.data = data;
	}
}

module.exports = {
	AjaxResponse,
};
