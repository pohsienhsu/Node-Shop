const { check, body } = require("express-validator");

const User = require("../models/user");

exports.signupValidation = [
  check("email")
    .trim()
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
    })
    .normalizeEmail(),
  body("name", "Please enter a valid name with only alphabets")
    .trim()
    .isLength({ min: 1 })
    .isAlpha(),
  body(
    "password",
    "Please enter a password with only numbers and text and at least 5 characters"
  )
    .trim()
    .isLength({ min: 5 })
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (!(value === req.body.password) || value === "") {
      return Promise.reject("Passwords have to match!");
    } else {
      return true;
    }
  }),
];

exports.loginValidation = [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body(
    "password",
    "Password has to be only numbers and alphabets with a minimum of length 5"
  )
    .trim()
    .isLength({ min: 5 })
    .isAlphanumeric(),
];

exports.addProductValidation = [
  body("title", "Please enter a valid product title with no special characters")
    .trim()
    .isLength({ min: 3 })
    .isString(),
  body("imageUrl", "Please enter a valid product image url").notEmpty().isURL(),
  body("price", "Please enter a valid price")
    .trim()
    .notEmpty()
    .isFloat({ min: 0 }),
  body("description", "Please enter a valid description")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage("Description should not exceed 255 characters"),
];

exports.editProductValidation = [
  body("title", "Please enter a valid product title with no special characters")
    .trim()
    .isLength({ min: 3 })
    .isString(),
  body("imageUrl", "Please enter a valid product image url").notEmpty().isURL(),
  body("price", "Please enter a valid price")
    .trim()
    .notEmpty()
    .isFloat({ min: 0 }),
  body("description", "Please enter a valid description")
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage("Description should not exceed 255 characters"),
];
