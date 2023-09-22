/**
 * @file
 */
class AjaxResponse {
	constructor(type = "error", msg = "", data = {}) {
		this.type = type;
		this.msg = msg;
		this.data = data;
	}
}

module.exports = {
	AjaxResponse,
};
