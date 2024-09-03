/**
 * @file Routes for pages from the root URL.
 *
 */

const router = require("express").Router();
const { PageRenderParams } = require("../classes/page-render-params");
const {
	GetIndexPage,
	GetChatPage,
	GetForgetPassword
} = require('../controllers/index-controller');
const basepath = "/";

/* GET routers****************************************************************/
router.get("/", GetIndexPage);

router.get("/chat", GetChatPage);

router.get("/forgot-password", GetForgetPassword);

router.get("/favicon.ico", (req, res) => res.status(204));

/* Testing routes ************************************************************/
router.get("/test", (req, res) => {
	const pageData = new PageRenderParams("Test", req.session, res.locals);
	res.render("test", pageData);
});

router.get("/ui-demo", (req, res) => {
	const pageData = new PageRenderParams("UI Demo", req.session, res.locals);
	res.render("ui-components", pageData);
});

module.exports = {
	router,
	basepath,
};
