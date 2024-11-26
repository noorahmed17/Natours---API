const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.setIdPassedOnRoute, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user", "admin"),
    reviewController.checkIfUserBookedTour,
    reviewController.setTourAndUserId,
    reviewController.createReview
  );

router.use(authController.restrictTo("user", "admin"));
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
