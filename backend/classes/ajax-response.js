/**
 * @file
 */
class AjaxResponse {
	constructor(type, msg, data) {
		this.type = type;
		this.msg = msg;
		this.data = data;
	}
}

module.exports = {
	AjaxResponse,
};
