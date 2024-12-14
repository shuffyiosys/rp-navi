const { PageRenderParams } = require("../classes/page-render-params");

function GetIndexPage(req, res) {
	const data = {
		loggedIn: `userID` in req.session,
	};
	const pageData = new PageRenderParams("Home", data, res.locals);
	res.render("index", pageData);
}

function GetChatPage(req, res) {
	const data = {
		loggedIn: `userID` in req.session,
	};
	const pageData = new PageRenderParams("RP Navi Chat", data, res.locals);
	res.render("chat", pageData);
}

function GetForgetPassword(req, res) {
	if (!(`userID` in req.session)) {
		const pageData = new PageRenderParams("Password reset request", req.session, res.locals);
		res.render("forgot-password", pageData);
	} else {
		res.redirect("/");
	}
}

module.exports = {
	GetIndexPage,
	GetChatPage,
	GetForgetPassword,
};
