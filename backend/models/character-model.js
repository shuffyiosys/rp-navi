/**
 * @file Defines the database schema for character data
 */
const mongoose = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

/** Database schema for characters

 */
let characterSchema = new mongoose.Schema(
	{
		charaName: {
			type: String,
			unique: true,
			required: true,
		},

		profileHtml: String,
		profileCss: String,
		profileJs: String,

		friends: [ObjectId],
		pendingFriends: [ObjectId],
	},
	{ collation: { locale: "en_US", strength: 2 }, timestamps: true }
);

mongoose.model(MODEL_NAMES.CHARACTER, characterSchema);
