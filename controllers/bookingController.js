const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const factory = require("./handlerFactory.js");
const AppCatchErr = require("../utils/appCatchErr");
const catchAsync = require("../utils/catchAsync");

//Check tour dates before booking
exports.checkTourDates = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppCatchErr("Invalid tour id", 404));
  }

  const filteredDates = tour.startDates.filter((el) => Date.now() < el);
  if (filteredDates.length === 0) {
    return next(new AppCatchErr("No available dates for this tour", 400));
  }

  tour.startDates = filteredDates;
  await tour.save();

  req.availableDates = filteredDates;
  next();
});

//Creating Checkout Session
exports.getSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: tour.name,
            description: `${
              tour.summary
            } - Start date: ${tour.startDates[0].toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}`,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  const imageUrl = `${req.protocol}://${req.get("host")}/img/tours/${
    tour.imageCover
  }`;

  res.status(200).json({
    status: "success",
    session,
  });
});

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  if (!tour || !user || !price) {
    console.error("Missing data for booking:", { tour, user, price });
    return;
  }

  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_KEY
    );
    console.log("Webhook received: ", event.type);
    if (event.type === "checkout.session.completed") {
      createBookingCheckout(event.data.object);
    }
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("PaymentIntent succeeded:", event.data.object);
      break;
    case "payment_intent.created":
      console.log("PaymentIntent created:", event.data.object);
      break;
    case "charge.updated":
      console.log("Charge updated:", event.data.object);
      break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }
  res.status(200).json({ received: true });
};

//Set Tour ID for Nested Route : /tours/tourId/booking || /users/userId/booking
exports.setId = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const { tourId, userId } = req.params;

  const filter = tourId ? { tour: tourId } : userId ? { user: userId } : {};
  req.bookings = await Booking.find(filter);

  if (req.bookings.length === 0)
    return next(new AppCatchErr("Not The Right Id For this Route", 400));
  next();
});

//Booking Routing Middlewars
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
