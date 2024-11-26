const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const AppCatchErr = require("../utils/appCatchErr");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

//Create And Send Token
const createAndSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieTokenExpires = parseInt(process.env.JWT_EXPIRES_IN, 10);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + cookieTokenExpires * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: { user },
  });
};

//User SignUp: Save User Data in DB and Send Token To User
exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(user, url).sendWelcome();
  createAndSendToken(user, 200, res);
});

//User SignIn: Ckeck If User Inputs are Correct Then Check if User Exist in DB and Send Token To User
exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppCatchErr("User Email or Password Are Incorrect", 401));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkUserPassword(password, user.password))) {
    return next(new AppCatchErr("User Does Not Exist", 401));
  }
  createAndSendToken(user, 200, res);
});

//Protected Route: Only Authenticated Users Can Access Certain Routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppCatchErr("Token is undefined", 401));
  }
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!verifiedToken) {
    return next(new AppCatchErr("You Are Not Authenticated", 401));
  }

  const decode = jwt.decode(token);
  const user = await User.findById(decode.id);
  if (!user) {
    return next(
      new AppCatchErr("User Belonging To This Token Does No Longer Exists", 401)
    );
  }

  if (user.checkPasswordChanged(decode.iat)) {
    return next(
      new AppCatchErr("User Changed Password, Token is Not Acceptable Anymore"),
      401
    );
  }
  req.user = user;
  res.locals.user = user;
  next();
});

//Logging Out Route
exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
};

//MiddleWare that Render The pages for loggedIn User
exports.loggedIn = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;

      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!verifiedToken) {
        return next();
      }

      const decode = jwt.decode(token);
      const user = await User.findById(decode.id);
      if (!user) {
        return next();
      }

      if (user.checkPasswordChanged(decode.iat)) {
        return next();
      }
      res.locals.user = user;
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

//Restriction: Check User Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppCatchErr(
          "You Do Not Have Permission To Perform This Action",
          403
        )
      );
    }
    next();
  };
};

//Forget Password: ForgetPassword Route Where User Reset His Password Via Email
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppCatchErr("Email is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppCatchErr("User Does Not Exist", 404));
  }

  const resetToken = user.createPassordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).resetPassword();

    res.status(200).json({
      status: "Token is sent to user",
      token: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppCatchErr(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

//Reset Password: ResetPassword Route Where User Reset His Password After Getting the Email
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  if (!token) {
    return next(new AppCatchErr("Token is required", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppCatchErr("Invalid token or expired", 400));
  }

  user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});

//Update Password: User Update his Password After logging in
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (
    !(await user.checkUserPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(
      new AppCatchErr("Password is incorect, Please Try Again!", 500)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = Date.now();
  await user.save();

  createAndSendToken(user, 200, res);
});
