/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { check } = require("express-validator");
const { PageRenderParams } = require("../classes/page-render-params");

const {
	createCharacter,
	getCharacterList,
	getCharacterProfile,
	getProfileData,
	getProfileEditor,
	updateProfile,
	deleteCharacter,
} = require("../controllers/character-controller");

const basepath = "/character";

/* GET routers ***************************************************************/
/* res.render responses */
router.get("/profile", getCharacterProfile);

router.get("/editor", getProfileEditor);

router.get("/editor-advanced", getProfileEditor);

router.get("/editor-help", (req, res) => {
	const pageData = new PageRenderParams("Profile Editor Help", {}, res.locals);
	res.render("character/editor-help", pageData);
});

/* res.json responses */
router.get("/profile-data", getProfileData);

router.get("/list", getCharacterList);

/* POST routers **************************************************************/
router.post("/create", [check("characterName").notEmpty().withMessage("No character name inputted")], createCharacter);

router.post("/update-profile", updateProfile);

router.post("/delete", deleteCharacter);

module.exports = {
	router,
	basepath,
};
