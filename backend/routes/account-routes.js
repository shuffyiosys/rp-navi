/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { check, query } = require("express-validator/check");

const {
	createAccount,
	getAccountData,
	logoutAccount,
	loginAccount,
	updateEmail,

	updatePassword,
	requestPasswordReset,
	verifyPasswordReset,
	updatePasswordReset,

	verifyAccount,
	resendVerification,
	deleteAccount,
} = require("../controllers/account-controller");

const basepath = "/account";

/* GET routers ***************************************************************/
router.get("/data", getAccountData);

router.get("/resendVerify", resendVerification);

router.get("/verify", [query("token").notEmpty().withMessage("Nothing to verify here...")], verifyAccount);

router.get("/resetPassowrd", [query("token").notEmpty()], verifyPasswordReset);

/* POST routers **************************************************************/
router.post(
	"/create",
	[
		check("email")
			.notEmpty()
			.withMessage("No email address entered")
			.normalizeEmail()
			.isEmail()
			.withMessage("Invalid email address format"),
		check("password", "Password must be at least 6 characters in length").isLength({ min: 5 }),
	],
	createAccount
);

router.post("/logout", logoutAccount);

router.post(
	"/login",
	[
		check("email")
			.notEmpty()
			.withMessage("No email address entered")
			.normalizeEmail()
			.isEmail()
			.withMessage("Invalid email address format"),
		check("password", "No password entered").notEmpty(),
	],
	loginAccount
);

router.post(
	"/update-password",
	[
		check("password", "No password entered").notEmpty(),
		check("newPassword", "New password must be at least 6 characters in length").isLength({ min: 5 }),
	],
	updatePassword
);

router.post(
	"/update-email",
	[
		check("newEmail")
			.notEmpty()
			.withMessage("No email address entered")
			.isEmail()
			.normalizeEmail()
			.withMessage("Invalid email address format"),
		check("password", "No password entered").notEmpty(),
	],
	updateEmail
);

router.post(
	"/forgotPassword",
	[
		check("email")
			.notEmpty()
			.withMessage("No email address entered")
			.isEmail()
			.normalizeEmail()
			.withMessage("Invalid email address format"),
	],
	requestPasswordReset
);

router.post(
	"/resetPassword",
	[check("newPassword", "New password must be at least 6 characters in length").isLength({ min: 5 })],
	updatePasswordReset
);

router.post("/delete", [check("password", "No password entered").notEmpty()], deleteAccount);

module.exports = {
	router,
	basepath,
};
