/**
 * Defines the database schema for user account data
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");
const { ACCESS_LEVEL, ACCOUNT_STATE } = require("../data/account-data");

/**
 * Database schema for accounts
 * @property {String} email Email of the account. This is what they use to login and is the primary key.
 * @property {String} password Password to authenticate. This should be hashed.
 * @property {Number} accessLevel accessLevel level that the account is set to
 * @property {String} emailVerifyKey Key for verifying an email address. If empty, consider the address verified.
 * @property {[String]} Blocked Array of blocked characters.
 */
let AccountSchema = new Schema(
	{
		email: {
			type: String,
			unique: true,
			required: true,
		},

		password: {
			type: String,
			required: true,
		},

		accessLevel: {
			type: Number,
			required: true,
			default: ACCESS_LEVEL.USER,
		},

		state: {
			type: Number,
			required: true,
			default: ACCOUNT_STATE.NORMAL,
		},

		emailVerifyKey: {
			type: String,
		},

		// TODO: Should probably change this to a map.
		blocked: [Schema.ObjectId],
	},
	{ collation: { locale: "en_US", strength: 2 }, timestamps: true }
);

model(MODEL_NAMES.ACCOUNT, AccountSchema);
