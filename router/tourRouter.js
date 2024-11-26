const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../router/reviewRouter");
const bookingRouter = require("../router/bookingRouter");
const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);
router.use("/:tourId/booking", bookingRouter);

router
  .route("/tour-within/distance/:distance/center/:latlng/unit/:unit")
  .get(tourController.getAllToursWithin);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.deleteTour
  );

module.exports = router;
