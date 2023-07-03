const { check, body } = require("express-validator");

const User = require("../models/user");

exports.signupValidation = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            "Email exists already, please use a different one"
          );
        }
      });
    }),
  body(
    "password",
    "Please enter a password with only numbers and text and at least 5 characters"
  )
    .isLength({ min: 5 })
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (!(value === req.body.password)) {
      return Promise.reject("Passwords have to match!");
    } else {
      return true;
    }
  }),
];

exports.loginValidation = [
  check("email").isEmail().withMessage("Please enter a valid email"),
  body("password", "Password has to be only numbers and alphabets with a minimum of length 5")
    .isLength({ min: 5 })
    .isAlphanumeric()
];
