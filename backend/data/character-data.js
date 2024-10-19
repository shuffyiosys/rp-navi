const RELATIONSHIP_TYPE = Object.freeze({
	FRIEND_REQUESTED: 0, // A sent a request to B
	REQUEST_FRIEND: 1, // B received a request from A
	FRIENDS: 2, // Both A and B are friends
});

module.exports = {
	RELATIONSHIP_TYPE,
};
