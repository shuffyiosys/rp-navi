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
const expect = require("chai").expect;

const RequestMock = require("../mocks/req-mock").RequestMock;
const ResponseMock = require("../mocks/res-mock").ResponseMock;
const controller = require("../../controllers/account-controller");
const utils = require("../utils/test-utils");

let accountData = {
	email: "test@test.com",
	newEmail: "anewemail@test.com",
	password: "123456",
	newPassword: "789456",
	verifyToken: "",
	id: 0,
};

function runTest() {
	describe("Normal expected behavior", function () {
		it("Sign up for an account", test_signup);
		it("Log into the account", test_login);
		it("Get account data", test_getData);
		it("Update email address", test_updateEmail);
		it("Update password", test_updatePassword);
		it("Log in with updated params", test_loginWithUpdates);
	});

	describe("Explicit fail behavior", function () {
		it("Sign up for an account with an email already in use", test_signupFailure);
		it("Get data with failure", test_getDataFailure);
		it("Log in with wrong account", test_loginAccountFailure);
		it("Log in with wrong password", test_loginPwFailure);
		it("Update email with one in use", test_updateTakenEmailFailure);
		it("Update email with bad data", test_updatedEmailFailure);
		it("Update password with bad data", test_updatePasswordFailure);
	});

	describe("Cleanup", function () {
		it("Deleting the account", test_delete);
	});
}

/**
 * NORMAL CASES
 *
 * Test steps
 *  1. Create an account
 *  2. Logging into the account
 *  3. Get the account's data
 *  4. Update the account's email
 *  5. Update the account's password
 */

async function test_signup() {
	const req = new RequestMock(accountData);
	const res = new ResponseMock();
	await controller.createAccount(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect("data" in res.jsonData).to.equal(true);
	accountData.id = req.session.userId;
}

async function test_login() {
	const req = new RequestMock(accountData);
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(req.session.userId).to.equal(accountData.id);
}

async function test_getData() {
	const req = new RequestMock({}, {}, { userId: accountData.id });
	const res = new ResponseMock();
	await controller.getAccountData(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data.email).to.equal(accountData.email);
}

async function test_updateEmail() {
	const req = new RequestMock(
		{ password: accountData.password, newEmail: accountData.newEmail },
		{},
		{ userId: accountData.id }
	);
	const res = new ResponseMock();
	await controller.updateEmail(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data.modifiedCount).to.equal(1);
}

async function test_updatePassword() {
	const req = new RequestMock(
		{ password: accountData.password, newPassword: accountData.newPassword },
		{},
		{ userId: accountData.id }
	);
	const res = new ResponseMock();
	await controller.getAccountData(req, res);
	await controller.updatePassword(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data.modifiedCount).to.equal(1);
}

async function test_loginWithUpdates() {
	const req = new RequestMock({ email: accountData.newEmail, password: accountData.newPassword });
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(req.session.userId).to.equal(accountData.id);
}

/**
 * FAILURE CASES
 *  1. Create an account with an existing email
 *  2. Logging into account with bad data
 *  3.
 *  4. Update the account's email
 *  5. Update the account's password
 */

async function test_signupFailure() {
	const req = new RequestMock({ email: accountData.newEmail, password: accountData.password });
	const res = new ResponseMock();
	await controller.createAccount(req, res);
	expect(res.jsonData.type).to.equal("error");
	expect("data" in res.jsonData).to.equal(false);
}

async function test_loginAccountFailure() {
	const req = new RequestMock({ email: "nobody@no.com", password: accountData.password });
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.jsonData.type).to.equal("error");
}

async function test_getDataFailure() {
	const req = new RequestMock({}, {}, {});
	const res = new ResponseMock();
	await controller.getAccountData(req, res);
	expect(res.jsonData.type).to.equal("error");
	expect("data" in res.jsonData).to.equal(false);
}

async function test_loginPwFailure() {
	const req = new RequestMock({ email: accountData.email, password: "000000" });
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.jsonData.type).to.equal("error");
}

async function test_updateTakenEmailFailure() {
	const req = new RequestMock(accountData, {}, { userId: accountData.id });
	const res = new ResponseMock();
	await controller.updateEmail(req, res);
	expect(res.jsonData.type).to.equal("error");
}

async function test_updatedEmailFailure() {
	const req = new RequestMock(
		{ password: accountData.password, newEmail: "nobody@no-one.com" },
		{},
		{ userId: accountData.id }
	);
	const res = new ResponseMock();
	await controller.updateEmail(req, res);
	expect(res.jsonData.type).to.equal("info");
}

async function test_updatePasswordFailure() {
	const req = new RequestMock(accountData, {}, { userId: accountData.id });
	const res = new ResponseMock();
	await controller.getAccountData(req, res);
	await controller.updatePassword(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data.modifiedCount).to.equal(0);
}

/**
 * CLEANUP CASES
 */
async function test_delete() {
	const req = new RequestMock(
		{ email: accountData.newEmail, password: accountData.newPassword },
		{},
		{ userId: accountData.id }
	);
	const res = new ResponseMock();
	await controller.deleteAccount(req, res);
	expect(res.jsonData.data.deletedCount).to.equal(1);
}

module.exports = {
	runTest,
};
