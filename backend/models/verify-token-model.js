/**
 * @file Defines the database schema for verification tokens
 */
const mongoose = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

const Schema = mongoose.Schema;

/** Database schema for verification tokens
 * @property {String} token - "Unique" string generated as the token ID
 * @property {Number} action - Which action this token is performing
 * @property {ObjectId} referenceId - The ID this token is meant for
 */
let VerifyTokenSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
		},

		action: {
			type: Number,
			required: true,
		},

		referenceId: {
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
mongoose.model(MODEL_NAMES.VERIFY_TOKENS, VerifyTokenSchema);
