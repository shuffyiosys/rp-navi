/**
 * Defines the schema for permanent chat rooms
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

let ChatRoomSchema = new Schema(
	{
		name: {
			type: String,
			unique: true,
			required: true,
			index: true,
		},

		description: String,

		group: {
			type: Schema.ObjectId,
			required: true,
		},

		owner: {
			type: Schema.ObjectId,
			required: true,
		},

		moderators: [Schema.ObjectId],

		private: {
			type: Boolean,
			default: false,
		},
	},
	{
		collation: { locale: "en_US", strength: 2 },
		autoIndex: false,
	}
);

model(MODEL_NAMES.CHAT_ROOM, ChatRoomSchema);
