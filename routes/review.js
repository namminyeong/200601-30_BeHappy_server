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
router.patch('/', utils.checkToken, reviewController.review.modifyReview);

// * DELETE /review
router.delete('/', utils.checkToken, reviewController.review.deleteReview);

// * GET /review/analysis
router.get(
  '/analysis',
  utils.checkToken,
  reviewController.rate.getReviewAnalysis
);

module.exports = router;
