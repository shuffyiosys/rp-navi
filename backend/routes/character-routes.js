/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();

const {
	createCharacter,
	getCharacters,
	getCharacterProfile,
	updateProfile,
	deleteCharacter,
} = require("../controllers/character-controller");

const basepath = "/character";

/* GET routers ***************************************************************/
router.get("/profile", getCharacterProfile);

router.get("/list", getCharacters);

/* POST routers **************************************************************/
router.post("/create", createCharacter);

router.post("/updateProfile", updateProfile);

router.post("/delete", deleteCharacter);

module.exports = {
	router,
	basepath,
};
