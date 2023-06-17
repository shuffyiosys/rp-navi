/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();

const {
	createAccount,
	getAccountData,
	logoutAccount,
	authenticateUser,
	updateEmail,
	updatePassword,
	deactivateAccount,
	deleteAccount,
} = require("../controllers/account-controller");
const { RenderData } = require("../utils/render-data");

const basepath = "/account";

/* GET routers ***************************************************************/
router.get("/data", getAccountData);

/* POST routers **************************************************************/
router.post("/logout", logoutAccount);

router.post("/create", createAccount);

router.post("/login", authenticateUser);

router.post("/update-password", updatePassword);

router.post("/update-email", updateEmail);

router.post("/delete", deleteAccount);

module.exports = {
	router,
	basepath,
};
