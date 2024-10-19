/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { check } = require("express-validator");
const { PageRenderParams } = require("../classes/page-render-params");

const {
	CreateCharacter,
	GetCharacterList,
	GetCharacterProfile,
	GetProfileData,
	GetProfileEditor,
	UpdateProfile,
	DeleteCharacter,
} = require("../controllers/character-controller");

const basepath = "/character";

/* GET routers ***************************************************************/
/* res.render responses */
router.get("/profile", GetCharacterProfile);

router.get("/editor", GetProfileEditor);

router.get("/editor-advanced", GetProfileEditor);

router.get("/editor-help", (req, res) => {
	const pageData = new PageRenderParams("Profile Editor Help", {}, res.locals);
	res.render("character/editor-help", pageData);
});

/* res.json responses */
router.get("/profile-data", GetProfileData);

router.get("/list", GetCharacterList);

/* POST routers **************************************************************/
router.post(
	"/create",
	[check("characterName").notEmpty().withMessage("No character name inputted")],
	CreateCharacter
);

router.post("/update-profile", UpdateProfile);

router.post("/delete", DeleteCharacter);

module.exports = {
	router,
	basepath,
};
