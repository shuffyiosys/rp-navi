/**
 * @file Constant data pertaining to accounts
 */

const PERMISSION_LEVELS = Object.freeze({
	ADMIN: 1,
	USER: 0,
	INACTIVE: -1,
	GHOSTED: -2,
	BANNED: -3,
});

module.export = {
	PERMISSION_LEVELS,
};
