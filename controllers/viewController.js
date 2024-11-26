const { title } = require("process");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const AppCatchErr = require("../utils/appCatchErr");
const catchAsync = require("../utils/catchAsync");

//Middleware To check for bookings
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === "booking")
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

//Rendering HomePage
exports.getOverView = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

//Rendering Tour Pages
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    populate: {
      path: "user",
      select: "name photo",
    },
  });
  if (!tour) {
    return next(new AppCatchErr("Tour not found", 404));
  }
  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

//Rendering Login Page
exports.getLogIn = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

//Rendering SignUp Page
exports.getSignUp = (req, res) => {
  res.status(200).render("signup", {
    title: "Signup",
  });
};

//Rendering User Account Page
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.getAllToursBooked = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});
