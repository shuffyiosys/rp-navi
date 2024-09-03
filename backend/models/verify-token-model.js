/**
 * Defines the database schema for verification tokens
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

/** Database schema for verification tokens
 * @property {String} token - "Unique" string generated as the token ID
 * @property {Number} action - Which action this token is performing
 * @property {ObjectId} referenceID - The ID this token is meant for
 */
let VerifyTokenSchema = new Schema(
	{
		token: {
			type: String,
			unique: true,
			required: true,
		},

		action: {
			type: Number,
			required: true,
		},

		referenceID: {
			type: String,
			required: true,
		},
	},
	{
		collation: { locale: "en_US", strength: 2 },
		timestamps: true,
	}
);

VerifyTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
model(MODEL_NAMES.VERIFY_TOKENS, VerifyTokenSchema);
