const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const favicon = require("serve-favicon");
const pug = require("pug");
const path = require("path");
const compression = require("compression");
const ratelimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const viewRouter = require("./router/viewRouter");
const tourRouter = require("./router/tourRouter");
const userRouter = require("./router/userRouter");
const reviewRouter = require("./router/reviewRouter");
const bookingRouter = require("./router/bookingRouter");
const globalErrorHandler = require("./controllers/errorController");
const bookingController = require("./controllers/bookingController");
dotenv.config({ path: "./config.env" });

const app = express();
const port = process.env.PORT || 5000;

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "img", "favicon.png")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

//Rate Limiting: Tp protect Aganist DOS attacks or Brutal attacks
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
});
app.use("/api", limiter);

//Setting HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://api.mapbox.com", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: [
        "'self'",
        "https://api.mapbox.com",
        "https://fonts.googleapis.com",
      ],
      imgSrc: [
        "'self'",
        "https://api.mapbox.com",
        "https://js.stripe.com",
        "data:",
      ],
      connectSrc: [
        "'self'",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://js.stripe.com",
      ],
      workerSrc: ["'self'", "blob:"],
    },
  })
);

app.use("/", viewRouter);
app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/booking", bookingRouter);

app.use("/bundle.js.map", (req, res, next) => {
  return res.status(404).send("Source map not found");
  next();
});

app.all("*", (req, res, next) => {
  const err = new Error(`NOT the original URL : ${req.originalUrl}`);
  next(err);
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
