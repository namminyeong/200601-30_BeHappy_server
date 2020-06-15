const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { reviewController } = require('../controller');

// * POST /review
router.post('/', utils.checkToken, reviewController.review.postReview);

// * GET /bookmark
// * PATCH /review
// * DELETE /bookmark

module.exports = router;
