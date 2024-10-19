/**
 * @file Defines the database schema for character data
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

/** Database schema for characters *******************************************/
let CharacterSchema = new Schema(
	{
		characterName: {
			type: String,
			unique: true,
			required: true,
			index: true,
		},

		owner: Schema.ObjectId,

		profileHtml: {
			type: String,
			default: "",
		},

		profileCss: {
			type: String,
			default: "",
		},

		profileJs: {
			type: String,
			default: "",
		},

		includeJquery: {
			type: Boolean,
			default: false,
		},

		friends: {
			type: Map,
			of: Number,
		},
	},
	{
		collation: { locale: "en_US", strength: 2 },
		timestamps: true,
		autoIndex: false,
	}
);

model(MODEL_NAMES.CHARACTER, CharacterSchema);
