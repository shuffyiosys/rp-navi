/**
 * @file Data constants describing user account levels
 */

const ACCESS_LEVEL = Object.freeze({
	ADMIN: 0, // Administrator
	USER: 1, // Normal user
	GHOSTED: 2, // Ignore all user generated data
	BANNED: 3, // User cannot access the site
});

const ACCOUNT_STATE = Object.freeze({
	NORMAL: 0, // No special state
	INVACTIVE: 1, // Account is flagged as inactive
	NEED_NEW_PASSOWRD: 2, // Account needs to update its password
});

const AUTHENTICATION_RESULT = Object.freeze({
	GENERAL_ERROR: 0,
	BANNED: 1,
	NEED_NEW_PASSWORD: 2,
	SUCCESS: 3,
});

module.exports = {
	ACCESS_LEVEL,
	ACCOUNT_STATE,
	AUTHENTICATION_RESULT,
};
