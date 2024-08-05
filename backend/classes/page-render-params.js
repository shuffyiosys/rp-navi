/**
 * @file Utility fucntions related to routing and web page rendering.1
 */
class PageRenderParams {
	constructor(title, data, locals) {
		this.title = `${title}`;
		this.data = data;
		this.scriptNonce = locals.scriptNonce;
		this.styleNonce = locals.styleNonce;
	}
}

module.exports = {
	PageRenderParams,
};
