const RELATIONSHIP_TYPE = Object.freeze({
	/* Two way relationships */
	FRIEND_REQUEST: 1,			// User A wants to be friends with User B
	FRIEND: 2,					// User A is friends with User B
});

module.exports = {
	RELATIONSHIP_TYPE,
};
