const express = require('express');
const router = express.Router();
const { userController } = require('../controller');

// * POST /user/signin
router.post('/signin', userController.signin.post);

// * POST /user/signup
router.post('/signup', userController.signup.signupForUser);

// * POST /user/signup/center
router.post('/signup/center', userController.signup.signupForCenter);

module.exports = router;
