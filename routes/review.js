const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { reviewController } = require('../controller');

// * POST /review
router.post('/', utils.checkToken, reviewController.review.postReview);

// * GET /review
router.get('/', utils.checkToken, reviewController.review.getReviewByUserId);

// * GET /review/center
router.get(
  '/center',
  utils.checkToken,
  reviewController.review.getReviewByCenterId
);

// * PATCH /review
// * DELETE /review

module.exports = router;