/**
 * @file Provides utility functions for controllers
 *
 */

const { validationResult } = require("express-validator");
const { AjaxResponse } = require("../classes/ajax-response");

/**
 * @brief Checks for commonly expected errors
 * @param {object} req - Request data from client
 * @returns If there are errors, then return the AJAX response. Otherwise return null.
 *
 * The expected errors are:
 * - If the request validator has errors
 * - If the request object doesn't have a session
 */
function verifyNoReqErrors(req) {
	const errors = validationResult(req);
	let response = null;
	if (errors.isEmpty() === false) {
		response = new AjaxResponse("error", "Errors with input", errors.array());
	} else if ("userId" in req.session === false) {
		response = new AjaxResponse("error", "Not logged in", {});
	}
	return response;
}

module.exports = {
	verifyNoReqErrors,
};
