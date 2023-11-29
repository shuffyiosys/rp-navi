/**
 * @file Provides utility functions for controllers
 *
 */

const { validationResult } = require("express-validator");
const { AjaxResponse } = require("../classes/ajax-response");

/**
 * @brief Checks for commonly expected errors
 * @param {object} req - Request data from client
 * @param {object} res - Response object to client
 * @returns True if there are errors, false otherwise
 *
 * The expected errors are:
 * - If the request validator has errors
 * - If the request object doesn't have a session
 */
function verifyNoReqErrors(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty() === false) {
		res.json(new AjaxResponse("error", "Errors with input", { errors: errors.array() }));
		return true;
	} else if ("userId" in req.session === false) {
		res.json(new AjaxResponse("error", "Not logged in", {}));
		return true;
	}
	return false;
}

module.exports = {
	verifyNoReqErrors,
};
