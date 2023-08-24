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
const { logger, formatJson } = require("../../utils/logger");
const utils = require("../utils/test-utils");

let accountData = {
	email: "test@test.com",
	newEmail: "test2@test.com",
	password: "123456",
	newPassword: "789456",
	verifyToken: "",
	id: 0,
};

function runTest() {
	describe("Normal expected behavior", function () {
		it("Signing up for an account", test_signup);
		it("Logging into the account", test_login);
	});

	describe("Explicit fail behavior", function () {
		it("Signing up for an account with an email already in use", test_signupFailure);
		it("Logging in with wrong account", test_loginAccountFailure);
		it("Logging in with wrong password", test_loginPwFailure);
	});

	describe("Cleanup", function () {
		it("Deleting the account", test_delete);
	});
}

/**
 * NORMAL CASES
 */

async function test_signup() {
	const req = new RequestMock(accountData);
	const res = new ResponseMock();
	await controller.createAccount(req, res);
	expect(res.json.type).to.equal("info");
	expect("data" in res.json).to.equal(true);
	accountData.id = req.session.userId;
	accountData.verifyToken = res.json.data.token;
	console.log(accountData);
}

async function test_login() {
	const req = new RequestMock(accountData);
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.json.type).to.equal("info");
	expect(req.session.userId).to.equal(accountData.id);
}

/**
 * FAILURE CASES
 */

async function test_signupFailure() {
	const req = new RequestMock(accountData);
	const res = new ResponseMock();
	await controller.createAccount(req, res);
	expect(res.json.type).to.equal("error");
	expect("data" in res.json).to.equal(false);
}

async function test_loginAccountFailure() {
	const req = new RequestMock({ email: "nobody@no.com", password: accountData.password });
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.json.type).to.equal("error");
}

async function test_loginPwFailure() {
	const req = new RequestMock({ email: accountData.email, password: "000000" });
	const res = new ResponseMock();
	await controller.loginAccount(req, res);
	expect(res.json.type).to.equal("error");
}

/**
 * CLEANUP CASES
 */
async function test_delete() {
	const req = new RequestMock(accountData, {}, { userId: accountData.id });
	const res = new ResponseMock();
	await controller.deleteAccount(req, res);
	expect(res.json.data.deletedCount).to.equal(1);
}

module.exports = {
	runTest,
};
