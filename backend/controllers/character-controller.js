const { verifyNoReqErrors } = require("../utils/controller-utils");
const { validationResult } = require(`express-validator`);
const { PageRenderParams } = require("../classes/page-render-params");
const { AjaxResponse } = require("../classes/ajax-response");
const characterService = require("../services/mongodb/character-service");
const { logger, formatJson } = require("../utils/logger");

async function CreateCharacter(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		logger.debug(`Errors with input: ${formatJson(errors.array())}`);
		res.json(new AjaxResponse(false, "Errors with input", errors.array()));
		return;
	} else if ("userID" in req.session === false) {
		logger.debug("Not logged in");
		res.json(new AjaxResponse(false, "Not logged in", {}));
		return;
	} else if (await characterService.GetCharacterExists(req.body.characterName)) {
		logger.debug("A character with this name exists");
		res.json(new AjaxResponse(false, "A character with this name exists"));
		return;
	}

	logger.info(`${req.session.userID} is creating character ${req.body.characterName}`);
	const characterData = await characterService.CreateCharacter(req.body.characterName, req.session.userID);
	if (characterData !== null) {
		res.json(new AjaxResponse(true));
	} else {
		res.json(new AjaxResponse(false, "Error creating the character", {}));
	}
}

async function GetCharacterList(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}
	const characterList = await characterService.GetCharacterList(req.session.userID);
	res.json(new AjaxResponse(true, "", characterList));
}

async function GetCharacterProfile(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}
	const characterName = req.query.name;
	const characterData = await characterService.GetCharacterProfile(characterName);
	const pageData = new PageRenderParams(
		`${characterName}'s profile`,
		{ name: characterName, noCharacter: false },
		res.locals
	);

	if (characterData === null) {
		pageData.title = "No character";
		pageData.data.noCharacter = true;
	}
	res.render("character/profile", pageData);
}

async function GetProfileData(req, res) {
	const characterName = req.query.name;
	const characterData = await characterService.GetCharacterProfile(characterName);
	if (characterData === null) {
		res.json(new AjaxResponse(false, `${characterName} does not exist`, {}));
	} else {
		res.json(new AjaxResponse(`info`, "", characterData));
	}
}

async function GetProfileEditor(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}

	const characterName = req.query.character;
	const ownerId = req.session.userID;
	const characterData = await characterService.GetCharacterData(characterName);
	if (characterData === null) {
		res.json(new AjaxResponse(false, "A character with this name does not exist", {}));
	} else if (characterData.owner.toString() != ownerId) {
		res.json(new AjaxResponse(false, "Account does not own character", {}));
	} else {
		const data = {
			name: characterData.characterName,
			html: characterData.profileHtml,
			css: characterData.profileCss,
			js: characterData.profileJs,
		};
		const pageData = new PageRenderParams("Character Profile Editor", data, res.locals);

		if (req.route.path == "/editor-advanced") {
			res.render("character/editor-advanced", pageData);
		} else {
			res.render("character/editor-basic", pageData);
		}
	}
}

async function UpdateProfile(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	} else if ((await characterService.GetCharacterExists(req.body.characterName)) === false) {
		response = new AjaxResponse(false, "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	const characterName = req.bodyreq.body.name;
	const userId = req.session.userID;
	const profileData = {
		profileHtml: req.body.html || "",
		profileCss: req.body.css || "",
		profileJs: req.body.js || "",
		includeJquery: req.body.includeJquery || false,
	};

	const updateData = await characterService.UpdateProfile(characterName, userId, profileData);
	if (updateData) {
		response = new AjaxResponse(true);
		res.json(response);
	} else {
		response = new AjaxResponse(false, "", { success: false });
	}
}

async function DeleteCharacter(req, res) {
	const userId = req.session.userID;
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}

	const characterExists = await characterService.GetCharacterExists(req.body.characterName);
	if (!characterExists) {
		response = new AjaxResponse(false, "A character with this name does not exist", {});
		res.json(response);
		return;
	}

	let updateData = await characterService.DeleteCharacter(req.body.characterName, userId);
	updateData.characterName = req.body.characterName;
	response = new AjaxResponse(true, "Deletion status", updateData);
	res.json(response);
}

module.exports = {
	CreateCharacter,
	GetCharacterList,
	GetCharacterProfile,
	GetProfileData,
	GetProfileEditor,
	UpdateProfile,
	DeleteCharacter,
};
