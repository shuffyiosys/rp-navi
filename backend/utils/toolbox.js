/**
 * General toolbox
 */

function sanitizeHTMLInput(input) {
	input = input.replaceAll(`&`, `&amp;`);
	input = input.replaceAll(`<`, `&lt`);
	input = input.replaceAll(`>`, `&gt`);
	input = input.replaceAll(`'`, `&apos;`);
	input = input.replaceAll(`"`, `&quot;`);
	return input;
}

module.exports = {
	sanitizeHTMLInput,
};
