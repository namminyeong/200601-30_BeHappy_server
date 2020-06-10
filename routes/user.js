const express = require('express');
const router = express.Router();
const { userController } = require('../controller');
const utils = require('../modules/utils');

// * POST /user/login
router.post('/login', userController.login.login);

// * GET /user/logout
router.get('/logout', utils.checkToken, userController.logout.logout);

// * POST /user/signup
router.post('/signup', userController.signup.signupForUser);

// * POST /user/signup/center
router.post('/signup/center', userController.signup.signupForCenter);

module.exports = router;
