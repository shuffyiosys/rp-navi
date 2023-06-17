require('../models/example-schema');
const mongoose = require('mongoose');
const model = mongoose.model('Example');

async function createExample(name, data) {
	return await model.create({name: name, data: data});
}

async function readExample(name, data) {
	let queryData = {};
	if (name) { queryData.name = name; }
	if (data) { queryData.data = data; }
	return await model.findOne(queryData);
}

async function updateEample(name, data, newName, newData) {
	let queryData = {};
	let newData = {};
	if (name) { queryData.name = name; }
	if (data) { queryData.data = data; }
	if (newName) { newData.name = newName; }
	if (newData) { newData.data = newData;}
	return await model.updateOne(queryData, newData);
}

async function deleteExample(name, data) {
	let queryData = {};
	if (name) { queryData.name = name; }
	if (data) { queryData.data = data; }
	return await model.deleteOne(queryData);
}

module.exports = {
	createExample,
	readExample,
	updateEample,
	deleteExample
}