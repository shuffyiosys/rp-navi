const MEMBER_RANK = Object.freeze({
	OWNER: 0, // Administrator
	COOWNER: 1,
	MODERATOR: 2, // Moderator
	MEMBER: 3, // Normal member
	REQUESTED: 4, // Requested member
	BANNED: 5, // Banned user
});

module.exports = {
	MEMBER_RANK,
};
