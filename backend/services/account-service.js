require('../models/account-model');
const mongoose = require('mongoose');
const model = mongoose.model('Account');
const {generateKey, getPasswordHash, verifyPassword} = require('../utils/crypto');
const { PERMISSION_LEVELS } = require('../data/account-data');

async function createAccount(username, password, email) {
	if (await model.exists({username: username}) == false) {
		const salt = await generateKey();
		const hash = await getPasswordHash(password, salt);
		const accountData = await model.create({
			username: username,
			password: hash,
			email: email
		})

		return accountData;
	}
	else {
		return null;
	}
}

async function getAccountData(accountId) {
	return await model.findOne({_id: accountId}, '-password');
}

async function authenticateUser(username, password) {
	let accountData = await model.findOne({username: username}, '_id username password');
	if (accountData !== null) {
		const pwMatch = await verifyPassword(accountData.password, password);
		accountData.password = undefined;
		if (pwMatch == false) {
			accountData = null;
		}
	}
	return accountData;
}

async function updateEmail(accountId, newEmail) {
	const updateData = await model.updateOne(
		{_id: accountId},
		{email: newEmail});
	return updateData;
}

async function updatePassword(accountId, newPassword) {
	const salt = await generateKey();
	const newPasswordHash = await getPasswordHash(newPassword, salt);
	const updateData = await model.updateOne(
		{_id: accountId},
		{password: newPasswordHash});
	return updateData;
}

async function deactivateAccount(accountId) {
	const updateData = await model.updateOne(
		{_id: accountId},
		{rank: PERMISSION_LEVELS.INACTIVE});
	return updateData;
}

async function deleteAccount(accountId) {
	const updateData = await model.deleteOne({id: accountId});
	return updateData;
}

module.exports = {
	createAccount,
	getAccountData,
	authenticateUser,
	updateEmail,
	updatePassword,
	deactivateAccount,
	deleteAccount
}