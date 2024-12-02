/**
 * Defines the database schema for user account data
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");

/**
 * Database schema for account bans
 */
let AccountBanSchema = new Schema(
	{
		accountID: {
			type: Schema.ObjectId,
			unique: true,
			required: true,
		},

		reason: {
			type: String,
			default: "",
		},
	},
	{
		collation: { locale: "en_US", strength: 2 },
		timestamps: true,
	}
);

AccountBanSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
model(MODEL_NAMES.ACCOUNT_BAN, AccountBanSchema);
