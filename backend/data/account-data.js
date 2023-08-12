/**
 * @file Constant data pertaining to accounts
 */

const PERMISSION_LEVELS = Object.freeze({
	ADMIN: 1,
	USER: 0,

	NEED_NEW_PASSWORD: -1,

	INACTIVE: -100,
	GHOSTED: -200,
	BANNED: -300,
});

module.exports = {
	PERMISSION_LEVELS,
};
