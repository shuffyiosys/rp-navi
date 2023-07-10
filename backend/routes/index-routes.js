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

module.exports = {
	router,
	basepath,
};
