const mongoose = require("mongoose");
const slugify = require("slugify");
const { type } = require("os");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour must have a name"],
      unique: true,
      trim: true,
    },
    slug: String,
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    duration: {
      type: Number,
      required: [true, "Tour must have a duration period"],
      default: 7,
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a maximun group size"],
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty level shpuld be easy, medium or difficult"],
      trim: true,
      enum: ["easy", "difficult", "medium"],
    },
    ratingsAverage: {
      type: Number,
      required: [true, "Tour must have a rating Average"],
      default: 4.5,
      min: [1, "rating should not be less than 1.0"],
      max: [5, "rating should not be more than 5.0"],
      set: function (val) {
        return Math.round(val * 10) / 10;
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    summary: {
      type: String,
      required: [true, "Tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Tour must have a description"],
      trim: true,
    },
    imageCover: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDates: [Date],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ startLocation: "2dsphere" });

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.select("-__v").populate({ path: "guides", select: "name photo email" });
  next();
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

module.exports = mongoose.model("Tour", tourSchema);
