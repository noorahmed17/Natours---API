const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const bookingRouter = require("../router/bookingRouter");
const router = express.Router();

router.use("/:userId/booking", bookingRouter);

router.route("/signup").post(authController.signUp);
router.route("/signin").post(authController.signIn);
router.route("/logout").get(authController.logout);

router.route("/forgetPassowrd").post(authController.forgetPassword);
router.route("/resetPassowrd/:token").patch(authController.resetPassword);

router.use(authController.protect);
router.route("/updatePassword").patch(authController.updatePassword);
router
  .route("/updateUser")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateCurrentUser
  );
router.route("/deleteAccount").delete(userController.deleteAccount);
router.route("/me").get(userController.getMe, userController.getUser);

router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .post(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
