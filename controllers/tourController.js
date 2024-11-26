const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const AppCatchErr = require("../utils/appCatchErr");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

//Tour Images Uploading - Processing - Updating
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppCatchErr("Not an Image, Please upload a photo", 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);
  req.body.imageCover = imageCoverFileName;

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );
  next();
});

//Tour Routing Middlewars
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//GeoSpatial Queries
exports.getAllToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = "unit" === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppCatchErr("Please provide lat and lng in the format lat,lng", 400)
    );
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng * 1, lat * 1], radius] },
    },
  });
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = "unit" === "mi" ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppCatchErr("Please provide lat and lng in the format lat,lng", 400)
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: { distances },
  });
});
