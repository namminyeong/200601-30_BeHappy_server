const express = require('express');
const router = express.Router();
const { userController } = require('../controller');
const utils = require('../modules/utils');

// * POST /user/signin
router.post('/signin', userController.signin.post);

// * GET /user/signout
router.get('/signout', utils.checkToken, userController.signout.get);

module.exports = router;
