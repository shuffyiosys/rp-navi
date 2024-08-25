/**
 * Defines the database schema for user account data
 * @file models/account-model.js
 */
const { Schema, model } = require("mongoose");
const { MODEL_NAMES } = require("./model-names");
const { PERMISSION_LEVELS } = require("../data/account-data");

/**
 * Database schema for accounts
 * @property {String} email - Email of the account. This is what they use to login and is the primary key
 * @property {String} password - Password to authenticate. This should be hashed
 * @property {Number} permissions - Permissions level that the account is set to
 * @property {Boolean} verified - Account's email has been verified
 */
let accountSchema = new Schema(
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

		permissions: {
			type: Number,
			required: true,
			default: PERMISSION_LEVELS.USER,
		},

		verified: {
			type: Boolean,
			default: false,
		},

		blocked: [Schema.ObjectId]
	},
	{ collation: { locale: "en_US", strength: 2 }, timestamps: true }
);

model(MODEL_NAMES.ACCOUNT, accountSchema);
