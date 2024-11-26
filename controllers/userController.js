const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const AppCatchErr = require("../utils/appCatchErr");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/handlerFactory");

//User Image Uploading - Processing - Updating
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

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

//User Routing Middlewars
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

//Middelware To Enable User to Get His Own Data
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//Update User Data: Enable User to Update his Personal info
exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppCatchErr("Password cannot be changed via this route", 400)
    );
  }
  if (req.file) req.body.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name || req.user.name,
      email: req.body.email || req.user.email,
      photo: req.body.photo || req.user.photo,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updateUser,
  });
});

//Delete User Account: User Delete His Account and Set Active to False in DB
exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
