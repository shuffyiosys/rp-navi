/******************************************************************************
 * Test steps
 *  1. Create an account
 *  2. Logging into the account
 *  3. Get the account's data
 *  4. Update the account's email
 *  5. Update the account's password
 *  6. Request the verify email
 *  7. Verify account
 *  8. Request password reset.
 *  9. Reset password
 * 10. Flag the account in needing a new password
 * 11. Set a new password
 * 12. Repeat 1-12 with issues
 * 13. Delete account
 * 14. Check if the account was really deleted
 */
const expect = require("chai").expect;
const {
	createAccount,
	accountExists,

	getAccountData,

	authenticateUser,

	updateEmail,
	updatePassword,

	updateVerification,
	deactivateAccount,
	deleteAccount,
} = require("../../services/account-service");

const accountService = require("../../services/account-service");

const cryptoUtil = require("../../utils/crypto");
const utilities = require("../test-utils");

const email_1 = `test_${utilities.pad(Math.ceil(Math.random() * 999999), 6)}@mail.com`;
const email_2 = `test_${utilities.pad(Math.ceil(Math.random() * 999999), 6)}@mail.com`;
const password_1 = `${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`;
const password_2 = `${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`;
const password_3 = `${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`;

let g_accountData = null;
let resetPwKey = null;
let verifyKey = null;

module.exports = () => {
	return describe("Testing account behavior", () => {
		it("Creating an account", test_createAccount);

		it("Logging in", test_loginAccount);
		it("Getting account data", test_getAccountData);

		it("Updating email", test_updateEmail);
		it("Updating password", test_updatePassword);
		it("Updating verification status", test_updatePassword);

		it("Flag for new password", test_setNewPasswordNeeded);

		// Intentional failure tests
		it("[BAD] Logging in", testBad_loginAccount);
		it("[BAD] Getting account data", testBad_searchForAccount);
		it("[BAD] Updating email", testBad_updateEmail);
		it("[BAD] Updating password", testBad_updatePassword);
		it("[BAD] Verifying account", testBad_verifyAccount);

		it("Deleting account", test_deleteAccount);
		it("Check if deleted account exists", test_getDeletedAccountData);
	});
};

async function test_createAccount() {
	try {
		let accountData = await createAccount(email_1, password_1);
		expect(accountData !== null).to.equal(true);
		g_accountData = accountData;
	} catch (err) {
		console.log("Error creating account, checking code to see if it exists.");
		expect(err.code).to.equal(11000);
	}
}

async function test_loginAccount() {
	let accountData = await authenticateUser(password_1, email_1, null);
	expect(accountData !== null).to.equal(true);
}

async function test_getAccountData() {
	let accountData = await getAccountData(g_accountData.id, null);
	expect(accountData !== null).to.equal(true);
	expect(accountData.email === g_accountData.email).to.equal(true);
	expect(accountData.verified === g_accountData.email).to.equal(true);
	expect(accountData.permissions === g_accountData.email).to.equal(true);
}

async function test_updateEmail() {
	let accountData = await updateEmail(g_accountData.id, password_1, email_2);
	expect(accountData !== null).to.equal(true);
	expect(accountData.email).to.equal(email_2);
}

async function test_updatePassword() {
	let accountData = await updatePassword(g_accountData.id, password_1, password_2);
	let passwordCheck = await cryptoUtil.verifyPassword(accountData.password, password_2);
	expect(passwordCheck).to.equal(true);
}

async function test_verifyAccount() {
	let accountData = await updateVerification(verifyKey);
	expect(accountData !== null).to.equal(true);
}

async function test_requestPwReset() {
	let resetPwKeyData = await deactivateAccount(email_2);
	expect(resetPwKeyData !== null).to.equal(true);
	resetPwKey = resetPwKeyData.resetPwKey;
}

async function test_verifyPasswordReset() {
	let resetPwKeyData = await accountService.verifyPasswordReset(resetPwKey);
	expect(resetPwKeyData !== null).to.equal(true);
}

async function test_resetPassword() {
	let resetPwResult = await accountService.resetPassword(g_accountData.id, password_3);
	expect(resetPwResult.ok === 1).to.equal(true);
}

async function test_setNewPasswordNeeded() {
	let accountData = accountService.setNeedNewPassword(g_accountData.id);
	expect(accountData !== null).to.equal(true);
}

async function test_deleteAccount() {
	let accountData = await deleteAccount(g_accountData.id);
	expect(accountData.ok).to.equal(1);
}

/* Failure tests *************************************************************/
async function testBad_loginAccount() {
	let accountData = await accountService.loginAccount(
		email_1,
		`${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`
	);
	expect(accountData === null).to.equal(true);
}

async function testBad_searchForAccount() {
	let accountData = await accountService.searchForAccount(
		{ email_1: `${utilities.pad(Math.ceil(Math.random() * 999999), 6)}` },
		[""]
	);
	expect(accountData === null).to.equal(true);
}

async function testBad_updateEmail() {
	let accountData = await accountService.updateEmail(
		g_accountData.id,
		`${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`,
		email_2
	);
	expect(accountData === null).to.equal(true);
}

async function testBad_updatePassword() {
	let accountData = await accountService.updatePassword(
		g_accountData.id,
		`${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`,
		password_2
	);
	expect(accountData === null).to.equal(true);
}

async function testBad_verifyAccount() {
	let accountData = await accountService.verifyAccount(`${utilities.pad(Math.ceil(Math.random() * 999999), 12)}`);
	expect(accountData.nModified).to.equal(0);
}

async function testBad_requestPwReset() {
	let resetPwKeyData = await accountService.requestPwReset(`${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`);
	expect(resetPwKeyData === null).to.equal(true);
}

async function testBad_verifyPasswordReset() {
	let resetPwKeyData = await accountService.verifyPasswordReset(
		`${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`
	);
	expect(resetPwKeyData === null).to.equal(true);
}

async function testBad_resetPassword() {
	let resetPwResult = await accountService.resetPassword(
		`${utilities.pad(Math.ceil(Math.random() * 999999), 12)}`,
		`${utilities.pad(Math.ceil(Math.random() * 999999), 6)}`
	);
	expect(resetPwResult === null).to.equal(true);
}

async function test_getDeletedAccountData() {
	let accountData = await accountService.getAccountData(g_accountData.id, [""]);
	expect(accountData === null).to.equal(true);
}
