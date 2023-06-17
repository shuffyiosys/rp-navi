function createGroup(groupName, groupDescription, characterName, characterId) {
	axios.post('/group/create', {
		groupName: groupName,
		groupDescription: groupDescription,
		characterName: characterName,
		characterId: characterId
	}).then(res => console.log(res.data))
}

function leaveGroup(groupName, characterName) {
	axios.post('/group/leave-group', {
		groupName: groupName,
		characterName: characterName
	}).then(res => console.log(res.data))
}

function joinGroup(groupName, characterName) {
	axios.post('/group/join-group', {
		groupName: groupName,
		characterName: characterName
	}).then(res => console.log(res.data))
}

function changeRole(groupName, characterName, targetName, newRole) {
	axios.post('/group/update-role', {
		groupName: groupName,
		characterName: characterName,
		targetName: targetName,
		newRole: newRole
	}).then(res => console.log(res.data))
}

function changeOwner(groupName, characterName, newOwner) {
	axios.post('/group/change-owner', {
		groupName: groupName,
		characterName: characterName,
		newOwner: newOwner,
	}).then(res => console.log(res.data))
}

function login() {
	axios.post('/account/login', {
		username: 'Test',
		password: '1234',
		email: "test@example.com"
	}).then(res => console.log(res.data))
}


function getCharacters() {
	return axios.get('/character/owned-list')
}