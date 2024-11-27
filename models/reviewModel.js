const mongoose = require("mongoose");
const Tour = require("../models/tourModel");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User Should Have A review"],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Tour Should Have A review"],
  },
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: 1 });

reviewSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

//Statics method to Calculate Average Rating on each tour
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numOfRating: { $sum: 1 },
        avgOfRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgOfRating,
      ratingsQuantity: stats[0].numOfRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.tour);
});

//Pre Middleware to find tour Id
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.currentReview = await this.model.findOne(this.getFilter());

  next();
});

//Post Middleware to update tour after delete or update review
reviewSchema.post(/^findOneAnd/, async function () {
  await this.currentReview.constructor.calcAverageRating(
    this.currentReview.tour
  );
});
module.exports = mongoose.model("Review", reviewSchema);
