const { Router } = require("express");

const {
  renderDashboard,
  renderCreateMyPortfolio,
  renderEditMyPortfolio,
  renderEditMyProfile,
  renderUserList,
} = require("../../controllers/view/privateController");

const router = Router();

// Private / endpoints
router.get("/dashboard", renderDashboard);

router.get("/:id/profile/edit", renderEditMyProfile);

router.get("/:id/portfolio/create", renderCreateMyPortfolio);

router.get("/portfolio/:id/edit/", renderEditMyPortfolio);

router.get("/users", renderUserList);

module.exports = router;
