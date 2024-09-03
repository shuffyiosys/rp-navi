/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { check, query, oneOf } = require("express-validator");

const {
	CreateAccount,
	GetAccountPage,
	GetAccountData,
	LogoutAccount,
	LoginAccount,
	UpdateEmail,

	UpdatePassword,
	RequestPasswordReset,
	VerifyPasswordReset,
	UpdatePasswordFromReset,

	VerifyAccount,
	ResendVerification,
	DeleteAccount,
} = require("../controllers/account-controller");

const basepath = "/account";

/* GET routers ***************************************************************/
router.get("/", GetAccountPage);

router.get("/data", GetAccountData);

router.get("/resendVerify", ResendVerification);

router.get("/verify", [query("token").notEmpty()], VerifyAccount);

router.get(
	"/reset-password",
	oneOf(query("token").notEmpty(), query("accountID").notEmpty()),
	VerifyPasswordReset
);

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
		check("password", "Password must be at least 8 characters in length").isLength({ min: 8 }),
	],
	CreateAccount
);

router.post("/logout", LogoutAccount);

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
	LoginAccount
);

router.post(
	"/update-password",
	[
		check("password", "No password entered").notEmpty(),
		check("newPassword", "New password must be at least 8 characters in length").isLength({ min: 8 }),
	],
	UpdatePassword
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
	UpdateEmail
);

router.post(
	"/forgot-password",
	[
		check("email")
			.notEmpty()
			.withMessage("No email address entered")
			.isEmail()
			.normalizeEmail()
			.withMessage("Invalid email address format"),
	],
	RequestPasswordReset
);

router.post(
	"/reset-password",
	[
		check("newPassword", "No password entered").notEmpty(),
		check("newPassword", "New password must be at least 8 characters in length").isLength({ min: 8 }),
	],
	UpdatePasswordFromReset
);

router.post("/delete", [check("password", "No password entered").notEmpty()], DeleteAccount);

module.exports = {
	router,
	basepath,
};
