/**
 * @file Routes for pages from the root URL.
 *
 */

const router = require("express").Router();
const { PageRenderParams } = require("../classes/page-render-params");
const basepath = "/test";

/* GET routers****************************************************************/
router.get("/basic-client", (req, res) => {
	const pageData = new PageRenderParams("Test", req.session, res.locals);
	res.render("test/basic-client", pageData);
});

router.get("/chat-ui", (req, res) => {
	const pageData = new PageRenderParams("Chat UI Demo", req.session, res.locals);
	res.render("test/chat-ui", pageData);
});

router.get("/ui-demo", (req, res) => {
	const pageData = new PageRenderParams("UI Demo", req.session, res.locals);
	res.render("test/ui-components", pageData);
});

module.exports = {
	router,
	basepath,
};
