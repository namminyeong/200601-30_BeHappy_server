const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { preferenceController } = require('../controller');

// * POST /preference
router.post('/', preferenceController.preference.postPreferenceForUser);

// * GET /preference
router.get(
  '/',
  utils.checkToken,
  preferenceController.preference.getPreferenceForUser
);

// * PATCH /preference
router.patch(
  '/',
  utils.checkToken,
  preferenceController.preference.patchPreferenceForUser
);

// * POST /preference/center
router.post('/center', preferenceController.preference.postPreferenceForCenter);

// * GET /preference/center
router.get(
  '/center',
  utils.checkToken,
  preferenceController.preference.getPreferenceForCenter
);

// * PATCH /preference/center
router.patch(
  '/center',
  utils.checkToken,
  preferenceController.preference.patchPreferenceForCenter
);

module.exports = router;
