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
			required: true
		},

		owner: {
			type: Schema.ObjectId,
			required: true
		},

		moderators: [Schema.ObjectId],

		members: [Schema.ObjectId],

		chatRoom: [Schema.ObjectId],

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

	},
	{
		collation: { locale: "en_US", strength: 2 },
		timestamps: true
	}
);

model(MODEL_NAMES.GROUP, GroupSchema);
