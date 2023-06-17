/**
 * @file Utility fucntions related to routing and web page rendering.1
 */
class RenderData {
	constructor(title, session, locals) {
		this.headTitle = `${title}`;
		this.title = `${title}`;
		this.loggedIn = 'editor' in session;
		this.scriptNonce = locals.scriptNonce;
		this.styleNonce = locals.styleNonce;
	}

	updateTitle(title) {
		this.headTitle = `${title}`;
		this.title = `${title}`;
	}
}

module.exports = {
	RenderData
};