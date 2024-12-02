/**
 * @file controllers/group-controller.js
 * @brief Handles the input requests and outgoing responses for group related functionality
 */
const { verifyNoReqErrors } = require("../utils/controller-utils");
const { logger, formatJson } = require(`../utils/logger`);
const { AjaxResponse } = require(`../classes/ajax-response`);
const { PageRenderParams } = require(`../classes/page-render-params`);
const GroupService = require(`../services/mongodb/group-service`);
const CharacterService = require(`../services/mongodb/character-service`);

async function GetGroupCreatePage(req, res) {
	logger.info(`${req.body.characterName} is making group ${req.body.groupName}`);

	const groupData = GroupService.CreateGroup(req.body.groupName, req.body.characterName);
	if (groupData !== null) {
		res.json(new AjaxResponse("success"));
	} else {
		res.json(new AjaxResponse("error", "Error creating the group", {}));
	}
}

async function GetGroupPage(req, res) {
	const groupData = GroupService.GetGroupPage(req.query.group);
	const pageData = new PageRenderParams(`${req.query.group}`, { name: req.query.group }, res.locals);

	if (groupData === null) {
		pageData.title = `Group not found`;
		res.render("group/not-found", pageData);
	} else {
		res.render("group/", pageData);
	}
}

async function GetGroupList(req, res) {
	let groupNames = [];

	if ("page-number" in req.query) {
		groupNames = GroupService.GetGroupList(req.query["page-number"]);
	} else {
		groupNames = GroupService.GetGroupList();
	}

	const pageData = new PageRenderParams("Groups", { names: groupNames }, res.locals);
	res.render("groups", pageData);
}

async function GetGroupPageEditor(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}

	const characterName = req.query.character;
	const ownerId = req.session.userID;
	const characterData = await GroupService(characterName);
	if (characterData === null) {
		res.json(new AjaxResponse("error", "A character with this name does not exist", {}));
	} else if (characterData.owner.toString() != ownerId) {
		res.json(new AjaxResponse("error", "Account does not own character", {}));
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

/** POST actions */
async function CreateGroup(req, res) {
	let response = verifyNoReqErrors(req, res);
	if (response !== null) {
		res.json(response);
		return;
	}

	if (await GroupService.CheckGroupExists(req.body.groupName)) {
		res.json(new AjaxResponse("error", "This group already exists", {}));
		return;
	} else if (!(await CharacterService.CheckOwnership(req.session.userID, req.body.characterName))) {
		res.json(new AjaxResponse("error", "Account doesn't own the character", {}));
		logger.notice(`Account ${req.session.userID} inputted unowned character ${req.body.characterName}`);
		return;
	}

	const groupData = await GroupService.CreateGroup(req.body.groupName, req.body.characterName);
	if (groupData === null) {
		res.json(new AjaxResponse("error", "There was an error creating the group", {}));
		return;
	} else {
		const pageData = new PageRenderParams("Group Page Editor", {}, res.locals);
		res.render("group/editor-basic", pageData);
	}
}

async function GetOwnedGroups(req, res) {}

async function UpdateGroupPage(req, res) {}

async function AddMemberRequest(req, res) {}

async function AcceptMemberRequest(req, res) {}

async function PromoteMember(req, res) {}

async function DemoteMember(req, res) {}

async function BanMember(req, res) {}

async function UnbanMember(req, res) {}

async function ChangeOwner(req, res) {}

async function DeleteGroup(req, res) {}

module.exports = {
	GetGroupCreatePage,
	GetGroupList,
	GetGroupPage,
	GetGroupPageEditor,

	CreateGroup,
	GetOwnedGroups,
	UpdateGroupPage,
	AddMemberRequest,
	AcceptMemberRequest,
	PromoteMember,
	DemoteMember,
	BanMember,
	UnbanMember,
	ChangeOwner,

	DeleteGroup,
};
