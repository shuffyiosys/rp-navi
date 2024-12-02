/**
 * Defines the schema for user groups
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

let GroupSchema = new Schema(
	{
		name: {
			type: String,
			unique: true,
			required: true,
			index: true,
		},

		// Map this to a character
		owner: {
			type: String,
			required: true,
		},

		members: {
			type: Map,
			of: Number,
		},

		pageHtml: {
			type: String,
			default: "",
		},

		pageCss: {
			type: String,
			default: "",
		},

		pageJs: {
			type: String,
			default: "",
		},

		// Room details
		roomName: String,
		description: String,
		password: String,
		privateRoom: { type: Boolean, default: false },
		membersOnly: { type: Boolean, default: false },
	},
	{
		collation: { locale: "en_US", strength: 2 },
		timestamps: true,
	}
);

model(MODEL_NAMES.GROUP, GroupSchema);
