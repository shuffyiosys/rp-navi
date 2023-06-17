const mongoose = require("mongoose");
const MODEL_NAME = "Example";

let exampleSchema = new mongoose.Schema(
	{
		name: String,
		data: Number,
	},
	{ collation: { locale: "en_US", strength: 2 }, timestamps: true }
);

mongoose.model(MODEL_NAME, exampleSchema);
