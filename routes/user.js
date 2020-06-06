const express = require('express');
const router = express.Router();
const { userController } = require('../controller');
const utils = require('../modules/utils');

// * POST /user/signin
router.post('/signin', userController.signin.post);

// * GET /user/signout
router.get('/signout', utils.checkToken, userController.signout.get);

// * POST /user/signup
router.post('/signup', userController.signup.signupForUser);

// * POST /user/signup/center
router.post('/signup/center', userController.signup.signupForCenter);

module.exports = router;
