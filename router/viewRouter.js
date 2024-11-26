const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(viewController.alerts);

router.get("/", authController.loggedIn, viewController.getOverView);
router.get("/tour/:slug", authController.loggedIn, viewController.getTour);
router.get("/login", authController.loggedIn, viewController.getLogIn);
router.get("/signup", viewController.getSignUp);

router.get("/me", authController.protect, viewController.getAccount);

router.get(
  "/my-tours",
  authController.protect,
  viewController.getAllToursBooked
);

module.exports = router;
