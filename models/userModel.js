const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Should Have a Name"],
      trim: true,
    },
    photo: { type: String, default: "default.jpg" },
    email: {
      type: String,
      required: [true, "User Should Have An Email"],
      unique: true,
      trim: true,
      lowercase: true,
      validator: [validator.isEmail, "This Should Be An Email"],
    },
    password: {
      type: String,
      required: [true, "User Should Have a Password"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please Confirm Your Password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords Shlould be the same",
      },
    },
    role: {
      type: String,
      enum: ["admin", "lead-guide", "guide", "user"],
      default: "user",
    },
    passwordCreatedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre(/^find/, function (next) {
  this.select("-__v -passwordCreatedAt -passwordChangedAt");
  next();
});

// userSchema.virtual("booking", {
//   ref: "Booking",
//   foreignField: "user",
//   localField: "_id"
// })

//Doc Middleware: to Encrypt Password Before Saving into DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//Doc Middleware: to Check if User Entered the Right Password Saved in DB
userSchema.methods.checkUserPassword = async function (
  userPassword,
  userPasswordInDB
) {
  return await bcrypt.compare(userPassword, userPasswordInDB);
};

//Doc Middleware: to Check if Password Changed After User is LoggedIn And Token is sent
userSchema.methods.checkPasswordChanged = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = new Date(this.passwordChangedAt).getTime();
    return jwtIssuedAt < passwordChangedTimestamp / 1000;
  }
  return false;
};

//Doc Middleware: to Create ResetToken And Saved it in Hashed From in DB
userSchema.methods.createPassordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //passwordResetExpires in 10 min
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
