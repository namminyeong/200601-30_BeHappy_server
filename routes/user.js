const express = require('express');
const router = express.Router();
const { userController } = require('../controller');

// * POST /user/signin
router.post('/signin', userController.signin.post);

module.exports = router;
