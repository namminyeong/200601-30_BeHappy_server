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

// * GET /user/admin/request
router.get('/admin/request', userController.adminRequest.getAdminRequest);

// * POST /user/admin/request
router.post('/admin/request', userController.adminRequest.postAdminRequest);

// * GET /user
router.get('/', utils.checkToken, userController.user.getUserInfo);

// * GET /user/admin
router.get('/admin', utils.checkToken, userController.user.getCenterAdminInfo);

module.exports = router;
