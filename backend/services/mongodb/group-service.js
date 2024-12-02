const mongoose = require("mongoose");
const { MODEL_NAMES } = require("../../models/model-names");
const model = mongoose.model(MODEL_NAMES.GROUP);

const { logger, formatJson } = require("../../utils/logger");
const { MEMBER_RANK } = require("../../data/group-data");

async function CreateGroup(groupName, characterName) {
	let groupData = null;
	logger.debug(`${characterName} is attempting to create the group ${groupName}`);

	// This can throw an exception
	try {
		groupData = await model.create({
			name: groupName,
			owner: characterName,
		});
	} catch (error) {
		logger.warn(`Error in [createGroup] ${formatJson(error)}`);
	}
	return groupData;
}

async function CheckGroupExists(groupName) {
	return await model.exists(groupName);
}

async function GetGroupPage(groupName) {
	const groupData = await model.findOne({ name: groupName }, "name pageHtml pageCss pageJs");
	return groupData;
}

async function GetGroupList(startIndex = 0) {
	return await model.find().select("name").skip(startIndex).limit(20);
}

async function SearchGroupName(searchTerm) {
	const regex = new RegExp(searchTerm, "i");
	return await model.find({ name: regex }, "name");
}

async function GetOwnedGroups(characterName) {
	return await model.find({ owner: characterName });
}

async function GetGroupData(groupName, characterName) {
	return await model.findOne({ name: groupName, owner: characterName });
}

async function UpdateGroupPage(groupName, characterName, newHtml, newCss, newJs) {
	const operationResult = await model.updateOne(
		{ name: groupName, owner: characterName },
		{ pageHtml: newHtml, pageCss: newCss, pageJs: newJs }
	);

	return operationResult;
}

async function AddMemberRequest(groupName, memberName) {
	const operationResult = await model.updateOne(
		{ name: groupName },
		{
			$set: {
				[`members.${memberName}`]: MEMBER_RANK.REQUESTED,
			},
		}
	);

	return operationResult;
}

async function AcceptMemberRequest(groupName, characterName, memberName) {
	const groupData = await model.findOne({ name: groupName }, "members");

	if (groupData === null) {
		return null;
	}

	if (groupData.members.get(characterName) <= MEMBER_RANK.MODERATOR) {
		const operationResult = await model.updateOne(
			{ name: groupName },
			{
				$set: {
					[`members.${memberName}`]: MEMBER_RANK.MEMBER,
				},
			}
		);

		return operationResult;
	}
	return { modifiedCount: 0 };
}

async function PromoteMember(groupName, characterName, memberName) {
	const groupData = await model.findOne({ name: groupName }, "members");

	if (groupData === null) {
		return null;
	}

	if (groupData.members.get(characterName) <= MEMBER_RANK.COOWNER) {
		const operationResult = await model.updateOne(
			{ name: groupName },
			{
				$set: {
					[`members.${memberName}`]: MEMBER_RANK.MODERATOR,
				},
			}
		);

		return operationResult;
	}
	return { modifiedCount: 0 };
}

async function DemoteMember(groupName, characterName, memberName) {
	const groupData = await model.findOne({ name: groupName }, "members");

	if (groupData === null) {
		return null;
	}

	if (groupData.members.get(characterName) <= MEMBER_RANK.COOWNER) {
		const operationResult = await model.updateOne(
			{ name: groupName },
			{
				$set: {
					[`members.${memberName}`]: MEMBER_RANK.MEMBER,
				},
			}
		);

		return operationResult;
	}
	return { modifiedCount: 0 };
}

async function BanMember(groupName, characterName, memberName) {
	const groupData = await model.findOne({ name: groupName }, "members");

	if (groupData === null) {
		return null;
	}

	if (
		groupData.members.get(characterName) <= MEMBER_RANK.MODERATOR &&
		groupData.members.get(memberName) > groupData.members.get(characterName)
	) {
		const operationResult = await model.updateOne(
			{ name: groupName },
			{
				$set: {
					[`members.${memberName}`]: MEMBER_RANK.BANNED,
				},
			}
		);

		return operationResult;
	}
	return { modifiedCount: 0 };
}

async function UnbanMember(groupName, characterName, memberName) {
	const groupData = await model.findOne({ name: groupName }, "members");

	if (groupData === null) {
		return null;
	}

	if (groupData.members.get(characterName) <= MEMBER_RANK.MODERATOR) {
		const operationResult = await model.updateOne(
			{ name: groupName },
			{
				$set: {
					[`members.${memberName}`]: MEMBER_RANK.MEMBER,
				},
			}
		);

		return operationResult;
	}
	return { modifiedCount: 0 };
}

async function ChangeOwner(groupName, characterName, newOwner) {
	const operationResult = await model.updateOne(
		{ name: groupName, owner: characterName },
		{ owner: newOwner }
	);
	return operationResult;
}

async function DeleteGroup(groupName, characterName) {
	const operationResult = await model.deleteOne({ name: groupName, owner: characterName });
	return operationResult;
}

module.exports = {
	CreateGroup,
	CheckGroupExists,
	GetGroupPage,
	GetGroupList,
	SearchGroupName,
	GetOwnedGroups,
	GetGroupData,
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
