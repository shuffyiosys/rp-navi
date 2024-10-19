const { sanitizeHTMLInput } = require(`./toolbox`);

function isEmail(input) {
	if (typeof input != "string") {
		return false;
	}
	input = input.toLowerCase();
	input = input.trim();
	input = sanitizeHTMLInput(input);
	return input.search(/.+@\S+\.\S+/) != -1;
}

function minLength(input, minLength) {
	if (typeof input != "string") {
		return false;
	}
	return input.length >= minLength;
}

function maxLength(input, maxLength) {
	if (typeof input != "string") {
		return false;
	}
	return input.length < maxLength;
}

function notEmpty(input) {
	if (typeof input != "string") {
		return false;
	}
	return input.length === 0;
}

module.exports = {
	isEmail,
	minLength,
	maxLength,
	notEmpty,
};
