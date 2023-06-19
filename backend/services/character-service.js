require('../models/character-model');
const mongoose = require('mongoose');
const { MODEL_NAMES } = require("../models/model-names");
const model = mongoose.model(MODEL_NAMES.CHARACTER);


async function createCharacter(req, res) {

}

async function getCharacters(req, res) {

}

async function getCharacterProfile(req, res) {

}

async function updateProfile(req, res) {

}

async function addPendingFriend(req, res) {

}

async function confirmPendingFriend(req, res) {

}

async function removeFriend(req, res) {

}

async function deleteCharacter(req, res) {

}

module.exports = {
	createCharacter,
	getCharacters,
	getCharacterProfile,
	updateProfile,
	addPendingFriend,
	confirmPendingFriend,
	removeFriend,
	deleteCharacter,
}