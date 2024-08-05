/**
 * @file Defines the database schema for character data
 */
const mongoose = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/** Database schema for characters *******************************************/
let characterSchema = new mongoose.Schema(
	{
		characterName: {
			type: String,
			unique: true,
			required: true,
			index: true,
		},

		owner: ObjectId,

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
	},
	{ collation: { locale: "en_US", strength: 2 }, timestamps: true, autoIndex: false }
);

mongoose.model(MODEL_NAMES.CHARACTER, characterSchema);
