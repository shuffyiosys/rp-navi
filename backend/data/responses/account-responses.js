const { AjaxResponse } = require(`../../classes/ajax-response`);

const RESPONSES = Object.freeze({
	// Success responses
	CREATED: new AjaxResponse(true, `Account created`, {}),

	// Error responses
	NOT_LOGGED_IN: new AjaxResponse(false, `Not logged in`, {}),
	CREATE_ERROR: new AjaxResponse(false, `Error creating an account`, {}),
});

module.exports = {
	RESPONSES,
};
