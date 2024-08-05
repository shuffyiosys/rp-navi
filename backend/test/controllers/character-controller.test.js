/** Dependencies *************************************************************/
const expect = require("chai").expect;

const RequestMock = require("../mocks/req-mock").RequestMock;
const ResponseMock = require("../mocks/res-mock").ResponseMock;
const controller = require("../../controllers/character-controller");
const utils = require("../utils/test-utils");

const NUM_CHARACTERS = Math.ceil(Math.random() * 3) + 5;

let primaryAccount;
let secondaryAccount;
let characterNames = [];

function runTest() {
	primaryAccount = utils.createRandomId();
	secondaryAccount = utils.createRandomId();
	for (let i = 0; i < 10; i++) {
		characterNames.push(utils.getRandomString());
	}

	describe("Normal expected behavior", function () {
		for (let i = 0; i < NUM_CHARACTERS; i++) {
			it(`Creating character (${i + 1})`, () => {
				return test_createCharacter(i);
			});
		}
		it("Update character profile", test_updateProfile);
		it("Get character list", test_getCharacters);
		it("Get character profile", test_getCharacterProfile);
	});

	describe("Explicit fail behavior", function () {
		it("Create a character with a name that already exists", test_createExistingCharacter);
		it("Get character list without a login session", test_getCharactersNoSession);
		it("Get a character that doesn't exist", test_getCharacterNotCreated);
	});

	describe("Cleanup", function () {
		for (let i = 0; i < NUM_CHARACTERS; i++) {
			it(`Deleting character (${i + 1})`, () => {
				test_deleteCharacter(i);
			});
		}
	});
}

async function test_createCharacter(index = 0) {
	const sessionData = { userId: primaryAccount };
	const req = new RequestMock({ characterName: characterNames[index] }, {}, sessionData);
	const res = new ResponseMock();
	await controller.createCharacter(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data).to.not.equal(null);
}

async function test_getCharacters() {
	const sessionData = { userId: primaryAccount };
	const req = new RequestMock({}, {}, sessionData);
	const res = new ResponseMock();
	await controller.getCharacters(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data).to.not.equal(null);
	expect(res.jsonData.data.length).to.equal(NUM_CHARACTERS);
}

async function test_updateProfile() {
	const sessionData = { userId: primaryAccount };
	const req = new RequestMock(
		{
			characterName: characterNames[0],
			html: utils.getRandomString(64),
			css: utils.getRandomString(64),
			js: utils.getRandomString(64),
		},
		{},
		sessionData
	);
	const res = new ResponseMock();
	await controller.updateProfile(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data.profileHtml).to.equal(req.body.html);
	expect(res.jsonData.data.profileCss).to.equal(req.body.css);
	expect(res.jsonData.data.profileJs).to.equal(req.body.js);
}

async function test_getCharacterProfile() {
	const req = new RequestMock({}, { name: characterNames[0] }, {});
	const res = new ResponseMock();
	await controller.getCharacterProfile(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data).to.not.equal(null);
}

async function test_createExistingCharacter() {
	const sessionData = { userId: secondaryAccount };
	const req = new RequestMock({ characterName: characterNames[0] }, {}, sessionData);
	const res = new ResponseMock();
	await controller.createCharacter(req, res);
	expect(res.jsonData.type).to.equal("error");
}

async function test_getCharactersNoSession() {
	const req = new RequestMock({}, {}, {});
	const res = new ResponseMock();
	await controller.getCharacters(req, res);
	expect(res.jsonData.type).to.equal("error");
}

async function test_getCharacterNotCreated() {
	const req = new RequestMock({}, { name: utils.getRandomString() }, {});
	const res = new ResponseMock();
	await controller.getCharacterProfile(req, res);
	expect(res.jsonData.type).to.equal("info");
	expect(res.jsonData.data).to.equal(null);
}

async function test_deleteCharacter(index = 0) {
	const sessionData = { userId: primaryAccount };
	const req = new RequestMock({ characterName: characterNames[index] }, {}, sessionData);
	const res = new ResponseMock();
	await controller.deleteCharacter(req, res);
	expect(res.jsonData.data.deletedCount).to.equal(1);
}

module.exports = {
	runTest,
};
