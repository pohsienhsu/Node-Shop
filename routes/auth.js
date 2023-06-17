const express = require('express');

const loginController = require("../controllers/auth");

const router = express.Router();

router.get("/login", loginController.getLogin);

router.post('/login', loginController.postLogin);

module.exports = router;

