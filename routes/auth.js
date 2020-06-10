const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { authController } = require('../controller');

// * GET /auth
router.get('/', utils.checkToken, authController.auth.checkAuthorization);

module.exports = router;
