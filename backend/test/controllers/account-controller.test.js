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
const { describe, it } = require("mocha");
const axios = require("axios");

let accountData = {
	email: "test@test.com",
	newEmail: "anewemail@test.com",
	password: "12345678",
	newPassword: "98765432",
	verifyToken: "",
	id: 0,
};

let cookie;

const URL_BASE = `http://localhost`;
const SERVER_PORT = 8080;
const TEST_URL = `${URL_BASE}:${SERVER_PORT}`;

function runTest() {
	describe("Normal expected behavior", function () {
		it("Sign up for an account", test_signup);
		it("Log into the account", test_login);
		it("Get account data", test_getData);
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
	describe("Cleanup", function () {
		// it("Deleting the account", test_delete);
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
	const response = await axios.post(
		`${TEST_URL}/account/create`,
		{
			email: accountData.email,
			password: accountData.password,
		},
		{
			withCredentials: true,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json",
			},
		}
	);

	expect(response.status).to.equal(200);
	expect(response.data.type).to.equal(`success`);
}

async function test_login() {
	const response = await axios.post(
		`${TEST_URL}/account/login`,
		{
			email: accountData.email,
			password: accountData.password,
		},
		{
			withCredentials: true,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json",
			},
		}
	);

	cookie = response.headers["set-cookie"][0];
	expect(response.status).to.equal(200);
	expect(response.data.type).to.equal(`success`);
}

async function test_getData() {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": "application/json",
		Cookie: cookie,
	};
	const response = await axios.get(`${TEST_URL}/account/data`, {
		withCredentials: true,
		headers: headers,
	});
	expect(response.status).to.equal(200);
	expect(response.data.type).to.equal(`success`);
	expect(response.data.data.email).to.equal(accountData.email);
}

async function test_delete() {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": "application/json",
		Cookie: cookie,
	};
	const response = await axios.post(
		`${TEST_URL}/account/delete`,
		{
			password: accountData.password,
		},
		{
			withCredentials: true,
			headers: headers,
		}
	);

	console.log(response.data);
	expect(response.status).to.equal(200);
	expect(response.data.type).to.equal(`success`);
}

module.exports = {
	runTest,
};
