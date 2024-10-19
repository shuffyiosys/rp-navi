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

/** Dependencies *************************************************************/
const accountService = require("../../services/mongodb/account-service");
const expect = require("chai").expect;
const { describe, it } = require("mocha");

let accountData = {
	email: "test@test.com",
	newEmail: "anewemail@test.com",
	password: "12345678",
	newPassword: "98765432",
	verifyToken: "",
	id: 0,
};

function runTest() {
	describe("Normal expected behavior", function () {
		it("Sign up for an account", test_signup);
		// it("Log into the account", test_login);
		// it("Get account data", test_getData);
		// it("Update email address", test_updateEmail);
		// it("Update password", test_updatePassword);
		// it("Log in with updated params", test_loginWithUpdates);
	});
	// describe("Explicit fail behavior", function () {
	// 	it("Sign up for an account with an email already in use", test_signupFailure);
	// 	it("Get data with failure", test_getDataFailure);
	// 	it("Log in with wrong account", test_loginAccountFailure);
	// 	it("Log in with wrong password", test_loginPwFailure);
	// 	it("Update email with one in use", test_updateTakenEmailFailure);
	// 	it("Update email with bad data", test_updatedEmailFailure);
	// 	it("Update password with bad data", test_updatePasswordFailure);
	// });
}

function runCleanup() {
	describe("Cleanup", function () {
		it("Deleting the account", test_delete);
	});
}

async function test_signup() {
	let data = await accountService.CreateAccount(accountData.email, accountData.password);
	expect(data).not.equal(null);
	accountData.id = data._id;
	console.log(data);
}

async function test_delete() {
	let data = await accountService.DeleteAccount(accountData.id);
	expect(data).not.equal(null);

	console.log(data);
}

module.exports = {
	runTest,
	runCleanup,
};
