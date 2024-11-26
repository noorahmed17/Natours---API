const Review = require("../models/reviewModel");
const Booking = require("../models/bookingModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appCatchErr");

//Middleware to check if user booked the tour
exports.checkIfUserBookedTour = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const userId = req.user.id;
  const booking = await Booking.findOne({ tour: tourId, user: userId });
  if (!booking) {
    return next(
      new AppError(
        "You haven't booked this tour Therefore You cannot Review on it",
        404
      )
    );
  }
  next();
});

//Middleware to set Tour And User ID from params
exports.setTourAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.setIdPassedOnRoute = async (req, res, next) => {
  if (req.params.tourId) {
    req.reviews = await Review.find({ tour: req.params.tourId });
  } else {
    req.reviews = await Review.find();
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
