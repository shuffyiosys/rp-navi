/**
 * @file Utility fucntions related to routing and web page rendering.1
 */
class PageRenderParams {
	constructor(title, session, locals) {
		this.headTitle = `${title}`;
		this.title = `${title}`;
		this.scriptNonce = locals.scriptNonce;
		this.styleNonce = locals.styleNonce;
	}
}

module.exports = {
	PageRenderParams,
};
