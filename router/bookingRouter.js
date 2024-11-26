const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/checkout-session/:tourId")
  .get(bookingController.checkTourDates, bookingController.getSession);

router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.setId, bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
