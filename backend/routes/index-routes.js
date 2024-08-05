/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { PageRenderParams } = require("../classes/page-render-params");
const { logger, formatJson } = require("../utils/logger");

const basepath = "/";

/* GET routers****************************************************************/
router.get("/", (req, res) => {
	const data = {
		loggedIn: `userId` in req.session,
	};
	const pageData = new PageRenderParams("Home", data, res.locals);
	res.render("index", pageData);
});

router.get("/chat", (req, res) => {
	const pageData = new PageRenderParams("RP Navi Chat", req.session, res.locals);
	res.render("chat", pageData);
});

router.get("/forgot-password", (req, res) => {
	if (!(`userId` in req.session)) {
		const pageData = new PageRenderParams("Password reset request", req.session, res.locals);
		res.render("forgot-password", pageData);
	} else {
		res.redirect("/");
	}
});

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/test", (req, res) => {
	const pageData = new PageRenderParams("Test", req.session, res.locals);
	res.render("test", pageData);
});

router.get("/ui-demo", (req, res) => {
	const pageData = new PageRenderParams("UI Demo", req.session, res.locals);
	res.render("ui-components", pageData);
});

router.post("/editor-submit", (req, res) => {
	console.log("Editor submission:", req.body);
	res.status(200);
});

module.exports = {
	router,
	basepath,
};
