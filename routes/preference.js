const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { preferenceController } = require('../controller');

// * POST /preference
router.post(
  '/',
  utils.checkToken,
  preferenceController.preference.postPreferenceForUser
);

// * GET /preference
// * PATCH /preference

// * POST /preference/center
router.post(
  '/center',
  utils.checkToken,
  preferenceController.preference.postPreferenceForCenter
);

// * GET /preference/center
// * PATCH /preference/center

module.exports = router;
