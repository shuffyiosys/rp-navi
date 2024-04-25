/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { PageRenderParams } = require("../classes/page-render-params");

const basepath = "/";

/* GET routers****************************************************************/
router.get("/", (req, res) => {
	const pageData = new PageRenderParams("Home", req.session, res.locals);
	res.render("index", pageData);
});

router.get("/test", (req, res) => {
	const pageData = new PageRenderParams("Test", req.session, res.locals);
	res.render("test", pageData);
});

router.get("/chat", (req, res) => {
	const pageData = new PageRenderParams("RP Navi Chat", req.session, res.locals);
	res.render("chat", pageData);
});

router.get("/favicon.ico", (req, res) => res.status(204));

module.exports = {
	router,
	basepath,
};
