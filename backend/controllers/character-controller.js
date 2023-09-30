const { validationResult } = require("express-validator");

const { AjaxResponse } = require("../classes/ajax-response");
const service = require("../services/character-service");
const { logger, formatJson } = require("../utils/logger");
const { verifyNoReqErrors } = require("../utils/controller-utils");

async function createCharacter(req, res) {
	const body = req.body;
	let response = {};
	if (verifyNoReqErrors(req, res) === true) {
		return;
	} else if (await service.getCharacterExists(body.charaName)) {
		response = new AjaxResponse("error", "A character with this name exists", {});
		res.json(response);
		return;
	}

	const characterData = await service.createCharacter(body.charaName, req.session.userId);
	if (characterData !== null) {
		response = new AjaxResponse("info", "Character created", characterData);
	} else {
		response = new AjaxResponse("error", "Error creating the character", {});
	}
	res.json(response);
}

async function getCharacters(req, res) {
	let response = {};
	if ("userId" in req.session === false) {
		response = new AjaxResponse("error", "Not logged in", {});
		res.json(response);
		return;
	}
	const characterList = await service.getCharacters(req.session.userId);
	response = new AjaxResponse("info", "", characterList);
	res.json(response);
}

async function getCharacterProfile(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(new AjaxResponse("error", "Errors with input", { errors: errors.array() }));
		return true;
	}
	const charaName = req.query.name;
	const characterData = await service.getCharacterProfile(charaName);
	if (characterData === null) {
		response = new AjaxResponse("info", "A character with this name does not exist", null);
	} else {
		response = new AjaxResponse("info", "", characterData);
	}
	res.json(response);
}

async function updateProfile(req, res) {
	const body = req.body;
	const session = req.session;
	let response = null;
	if (verifyNoReqErrors(req, res) === true) {
		return;
	} else if ((await service.getCharacterExists(body.charaName)) === false) {
		response = new AjaxResponse("error", "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	const charaName = body.charaName;
	const userId = session.userId;
	const profileData = {
		profileHtml: body.html,
		profileCss: body.css,
		profileJs: body.js,
	};

	const updateData = await service.updateProfile(charaName, userId, profileData);
	response = new AjaxResponse("info", "Update status", updateData);
	res.json(response);
}

async function deleteCharacter(req, res) {
	let response = null;
	const charaName = req.body.charaName;
	const userId = req.session.userId;
	if (verifyNoReqErrors(req, res) === true) {
		return;
	} else if ((await service.getCharacterExists(charaName)) === false) {
		response = new AjaxResponse("error", "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	const updateData = await service.deleteCharacter(charaName, userId);
	response = new AjaxResponse("info", "Deletion status", updateData);
	res.json(response);
}

module.exports = {
	createCharacter,
	getCharacters,
	getCharacterProfile,
	updateProfile,
	deleteCharacter,
};
