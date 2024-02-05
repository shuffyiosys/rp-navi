class SocketIoResponse {
	constructor(message = "", data = null) {
		this.success = false;
		this.message = message;
		this.data = data;
	}
}

module.exports = {
	SocketIoResponse,
};
