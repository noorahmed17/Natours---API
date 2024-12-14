const appCatchErr = require("../utils/appCatchErr");


//MongoDD Errors
const castErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appCatchErr(message, 400);
};

const duplicateKeyErrorDB = (err) => {
  let name = err.keyValue ? Object.values(err.keyValue).join(",") : "";
  const message = `Dulplicate field: ${name}. Please enter another field`;
  return new appCatchErr(message, 400);
};

const validatorErrorDB = (err) => {
  let errMessage = Object.values(err.errors).map((el) => el.message);
  const message = `Validator error: ${errMessage.join(". ")}`;
  return new appCatchErr(message, 400);
};

//Tokens Error
const tokenExpiredError = (err) => {
  const message = "Your token has expired. Please login again";
  return new appCatchErr(message, 401);
};
const jsonWebTokenError = (err) => {
  const message = "Invalid Token. Please login again";
  return new appCatchErr(message, 401);
};

//Development Environment Error
const developError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.log(err);
  return res.status(err.statusCode).render("error", {
    title: "Error",
    msg: err.message,
  });
};

//Production Environment Error
const productionError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log(err);
    return res.status(err.statusCode).json({
      status: "error",
      message: "Something went wrong, Please retry Later",
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }

  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
};

//Global Error Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV === "development") {
    developError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = {
      ...err,
      name: err.name,
      message: err.message,
    };
    console.log("ERROR", JSON.stringify(error));

    if (error.name === "CastError") error = castErrorDB(error);
    else if (error.code === 11000) error = duplicateKeyErrorDB(error);
    else if (error.name === "ValidationError") error = validatorErrorDB(error);
    else if (error.nama === "TokenExpiredError")
      error = tokenExpiredError(error);
    else if (error.name === "JsonWebTokenError")
      error = jsonWebTokenError(error);
    productionError(error, req, res);
  }
};
