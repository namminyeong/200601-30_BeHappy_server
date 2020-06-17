const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { centerController } = require('../controller');

// * GET /center
router.get('/', utils.checkToken, centerController.center.getCenterInfo);

module.exports = router;
