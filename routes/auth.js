const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");
const isValid = require("../middleware/is-valid");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", isValid.loginValidation, authController.postLogin);

router.post("/logout", isAuth, authController.postLogout);

router.get("/signup", authController.getSignup);

router.post("/signup", isValid.signupValidation, authController.postSignup);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
