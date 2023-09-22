const { validationResult } = require("express-validator");

const { AjaxResponse } = require("../classes/ajax-response");
const config = require("../config/config")();
const service = require("../services/character-service");
const mailer = require("../utils/mailer");
const { logger, formatJson } = require("../utils/logger");
const { verifyNoReqErrors } = require("../utils/controller-utils");

async function createCharacter(req, res) {
	const body = req.body;
	let response = {};
	if (verifyNoReqErrors(req, res) === true) {
		return;
	} else if (await service.getCharacterExists(body.characterName)) {
		response = new AjaxResponse("error", "A character with this name exists", {});
		res.json(response);
		return;
	}

	const characterData = await service.createCharacter(body.characterName, req.session.userId);
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
	let response = null;
	if (verifyNoReqErrors(req, res) === true) {
		return;
	} else if ((await service.getCharacterExists(body.characterName)) === false) {
		response = new AjaxResponse("error", "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	const charaName = req.body.charaName;
	const userId = req.session.userId;
	const profileData = {
		profileHtml: req.body.html,
		profileCss: req.body.css,
		profileJs: req.body.js,
	};

	const updateData = await service.updateProfile(charaName, userId, profileData);
	response.data = updateData;
	response.msg = "Update status";
	res.json(response);
}

async function deleteCharacter(req, res) {
	let response = null;
	const charaName = req.body.characterName;
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
