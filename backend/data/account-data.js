/**
 * @file Data constants describing user account levels
 */

const PERMISSION_LEVELS = Object.freeze({
	ADMIN: 100,					// Administrator
	USER: 0,					// Normal user

	NEED_NEW_PASSWORD: -1,		// User needs to reset their password on next login

	INACTIVE: -100,				// User is inactive
	GHOSTED: -200,				// Ignore all user generated data
	BANNED: -300,				// User cannot access the site
});

module.exports = {
	PERMISSION_LEVELS,
};
