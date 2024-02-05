/**
 * @file Defines the database schema for character data
 */
const mongoose = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/** Database schema for character relationships
 * For one-way relationships, e.g., blocking, the direction is characterOne -> characterTwo.
 * characterTwo doesn't get to know this relationship.
 *
 * For two-way relationships, e.g., friends, both characters can know the relationship.
 */

let relationshipSchema = new mongoose.Schema(
	{
		characterOne: {
			type: ObjectId,
			index: true,
		},
		characterTwo: {
			type: ObjectId,
			index: true,
		},
		relationship: Number,
	},
	{ collation: { locale: "en_US", strength: 2 }, timestamps: true }
);

mongoose.model(MODEL_NAMES.RELATIONSHIP, relationshipSchema);
