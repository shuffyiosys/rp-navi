/**
 * Handles all character relationships
 */
const { RELATIONSHIP_TYPE } = require("../../data/relationship-data");
const { logger, formatJson } = require("../../utils/logger");
const { MODEL_NAMES } = require("../../models/model-names");

const mongoose = require("mongoose");
const model = mongoose.model(MODEL_NAMES.RELATIONSHIP);
const ObjectId = mongoose.Types.ObjectId;

async function requestFriend(requester, recipient) {
	logger.debug(`User ${requester} is sending a friend request to ${recipient}`);
	let relationshipData = await model.findOne({
		$or: [
			{ characterOne: requester, characterTwo: recipient },
			{ characterOne: recipient, characterTwo: requester },
		],
	});

	if (relationshipData == null) {
		relationshipData = await model.create({
			characterOne: ObjectId(requester),
			characterTwo: ObjectId(recipient),
			relationship: RELATIONSHIP_TYPE.FRIEND_REQUEST,
		});
	} else if (
		requester.equals(relationshipData.characterTwo) &&
		relationshipData.relationship == RELATIONSHIP_TYPE.FRIEND_REQUEST
	) {
		relationshipData.relationship = RELATIONSHIP_TYPE.FRIEND;
		relationshipData = await relationshipData.save();
	}
	return relationshipData;
}

async function removeFriend(requester, recipient) {
	logger.debug(`User ${requester} is removing a friend ${recipient}`);

	let operationResult = await model.findOneAndDelete({
		$or: [
			{
				characterOne: ObjectId(requester),
				characterTwo: ObjectId(recipient),
				relationship: { $gte: RELATIONSHIP_TYPE.FRIEND_REQUEST },
			},
			{
				characterOne: ObjectId(recipient),
				characterTwo: ObjectId(requester),
				relationship: { $gte: RELATIONSHIP_TYPE.FRIEND_REQUEST },
			},
		],
	});

	return operationResult;
}

async function blockUser(requester, recipient) {
	logger.debug(`User ${requester} is blocking user ${recipient}`);

	let relationshipData = await model.findOne({
		$or: [
			{ characterOne: requester, characterTwo: recipient },
			{ characterOne: recipient, characterTwo: requester },
		],
	});

	if (relationshipData == null) {
		relationshipData = await model.create({
			characterOne: ObjectId(requester),
			characterTwo: ObjectId(recipient),
			relationship: RELATIONSHIP_TYPE.BLOCKED,
		});
	} else {
		relationshipData.relationship = RELATIONSHIP_TYPE.BLOCKED;
		relationshipData = await relationshipData.save();
	}
	return relationshipData;
}

async function unblockUser(requester, recipient) {
	logger.debug(`User ${requester} is unblocking a user ${recipient}`);

	let operationResult = await model.findOneAndDelete({
		characterOne: ObjectId(requester),
		characterTwo: ObjectId(recipient),
		relationship: RELATIONSHIP_TYPE.BLOCKED,
	});

	return operationResult;
}

async function getRelationship(requester, recipient) {
	let relationshipData = await model.findOne(
		{
			$or: [
				{ characterOne: requester, characterTwo: recipient },
				{ characterOne: recipient, characterTwo: requester },
			],
		},
		"characterOne relationship"
	);
	return relationshipData;
}

module.exports = {
	requestFriend,
	removeFriend,
	blockUser,
	unblockUser,
	getRelationship,
};
