const RELATIONSHIP_TYPE = Object.freeze({
	/* One way relationships */
	BLOCKED: -1,

	/* Two way relationships */
	FRIEND_REQUEST: 1,
	FRIEND: 2,
});

module.exports = {
	RELATIONSHIP_TYPE,
};
