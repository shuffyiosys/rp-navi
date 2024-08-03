/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { check, query } = require("express-validator");

const {
	createCharacter,
	getCharacterList,
	getCharacterProfile,
	getProfileEditor,
	updateProfile,
	deleteCharacter,
} = require("../controllers/character-controller");

const basepath = "/character";

/* GET routers ***************************************************************/
router.get("/profile", getCharacterProfile);

router.get("/list", getCharacterList);

router.get("/edit", getProfileEditor);

/* POST routers **************************************************************/
router.post("/create", [check("charaName").notEmpty().withMessage("No character name inputted")], createCharacter);

router.post("/updateProfile", updateProfile);

router.post("/delete", deleteCharacter);

module.exports = {
	router,
	basepath,
};
