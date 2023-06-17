const mongoose = require('mongoose');

var exampleSchema = new mongoose.Schema({
	name: String,
	data: Number,
}, 
{ collation: { locale: 'en_US', strength: 2 }, timestamps: true});

mongoose.model('Example', exampleSchema);