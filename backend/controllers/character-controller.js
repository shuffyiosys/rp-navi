const { verifyNoReqErrors } = require("../utils/controller-utils");
const { PageRenderParams } = require("../classes/page-render-params");
const { AjaxResponse } = require("../classes/ajax-response");
const characterService = require("../services/mongodb/character-service");
const { logger, formatJson } = require("../utils/logger");

async function createCharacter(req, res) {
	const body = req.body;
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	} else if (await characterService.getCharacterExists(body.characterName)) {
		response = new AjaxResponse("error", "A character with this name exists", {});
		res.json(response);
		return;
	}

	const characterData = await characterService.createCharacter(body.characterName, req.session.userId);
	if (characterData !== null) {
		response = new AjaxResponse("info", "Character created", characterData);
	} else {
		response = new AjaxResponse("error", "Error creating the character", {});
	}
	res.json(response);
}

async function getCharacterList(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}
	const characterList = await characterService.getCharacterList(req.session.userId);
	response = new AjaxResponse("info", "", characterList);
	res.json(response);
}

async function getCharacterProfile(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}
	const characterName = req.query.name;
	const characterData = await characterService.getCharacterProfile(characterName);
	if (characterData === null) {
		response = new AjaxResponse("info", "A character with this name does not exist", null);
	} else {
		response = new AjaxResponse("info", "", characterData);
	}
	res.json(response);
}

async function getProfileEditor(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}

	const characterName = req.query.character;
	const ownerId = req.session.userId;
	const characterData = await characterService.getCharacterData(characterName);
	if (characterData === null) {
		response = new AjaxResponse("error", "A character with this name does not exist", {});
		res.json(response);
	} else if (characterData.owner.toString() != ownerId) {
		response = new AjaxResponse("error", "Account does not own character", {});
		res.json(response);
	} else {
		res.locals.charactId = characterData._id;
		const pageData = new PageRenderParams("Character Profile Editor", req.session, res.locals);
		res.render("edit-character", pageData);
	}
}

async function updateProfile(req, res) {
	const body = req.body;
	const session = req.session;
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	} else if ((await characterService.getCharacterExists(body.characterName)) === false) {
		response = new AjaxResponse("error", "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	const characterName = body.characterName;
	const userId = session.userId;
	const profileData = {
		profileHtml: body.html,
		profileCss: body.css,
		profileJs: body.js,
	};

	const updateData = await characterService.updateProfile(characterName, userId, profileData);
	response = new AjaxResponse("info", "Update status", updateData);
	res.json(response);
}

async function deleteCharacter(req, res) {
	const characterName = req.body.characterName;
	const userId = req.session.userId;
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}

	const characterExists = await characterService.getCharacterExists(characterName);
	if (!characterExists) {
		response = new AjaxResponse("error", "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	const updateData = await characterService.deleteCharacter(characterName, userId);
	response = new AjaxResponse("info", "Deletion status", updateData);
	res.json(response);
}

module.exports = {
	createCharacter,
	getCharacterList,
	getCharacterProfile,
	getProfileEditor,
	updateProfile,
	deleteCharacter,
};
