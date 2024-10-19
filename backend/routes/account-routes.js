/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const validators = require("../data/validators/account-validators");
const { oneOf } = require("express-validator");

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

router.get("/verify", [validators.tokenQuery], VerifyAccount);

router.get("/reset-password", oneOf(validators.tokenQuery, validators.accountIDQuery), VerifyPasswordReset);

/* POST routers **************************************************************/

router.post("/create", [validators.createEmail, validators.newPassword], CreateAccount);

router.post("/logout", LogoutAccount);

router.post("/login", [validators.email, validators.passwordEntry], LoginAccount);

router.post("/update-password", [validators.passwordEntry, validators.newPassword], UpdatePassword);

router.post("/update-email", [validators.email, validators.passwordEntry], UpdateEmail);

router.post("/forgot-password", [validators.email], RequestPasswordReset);

router.post("/reset-password", [validators.newPassword], UpdatePasswordFromReset);

router.post("/delete", [validators.passwordEntry], DeleteAccount);

module.exports = {
	router,
	basepath,
};
