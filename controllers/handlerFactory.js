const AppCatchErr = require("../utils/appCatchErr");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (Model) => async (req, res, next) => {
  const doc = req.reviews || req.bookings || (await Model.find());
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: { doc },
  });
};

exports.getOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (options) query = query.populate(options);
    const doc = await query;

    if (!doc) {
      return next(new AppCatchErr("document not found with this ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: { doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: { doc },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppCatchErr("Document not found with that ID", 404));
    }
    res.status(201).json({
      status: "success",
      data: { doc },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppCatchErr("document not found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
