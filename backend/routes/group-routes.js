/**
 * @file Routes for pages from the root URL.
 *
 */
const router = require("express").Router();
const { check } = require("express-validator");
const GroupController = require("../controllers/group-controller");
const basepath = "/group";

/* GET routers ***************************************************************/
/* res.render responses */
router.get("/create-group", GroupController.GetGroupCreatePage);

router.get("/group", GroupController.GetGroupPage);

router.get("/editor", GroupController.GetGroupPageEditor);

router.get("/editor-advanced", GroupController.GetGroupPageEditor);

/* res.json responses */
router.get("/get-owned-groups", GroupController.GetOwnedGroups);

/* POST routers **************************************************************/
router.post("/create", GroupController.CreateGroup);

router.post("/update-group-page", GroupController.UpdateGroupPage);
router.post("/add-member-request", GroupController.AddMemberRequest);
router.post("/accept-member-request", GroupController.AcceptMemberRequest);
router.post("/promote-member", GroupController.PromoteMember);
router.post("/demote-member", GroupController.DemoteMember);
router.post("/ban-member", GroupController.BanMember);
router.post("/unban-member", GroupController.UnbanMember);
router.post("/change-owner", GroupController.ChangeOwner);

router.post("/delete", GroupController.DeleteGroup);

module.exports = {
	router,
	basepath,
};
