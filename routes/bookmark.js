const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { bookmarkController } = require('../controller');

// * POST /bookmark
router.post('/', utils.checkToken, bookmarkController.bookmark.postBookmark);

// * DELETE /bookmark
router.delete(
  '/',
  utils.checkToken,
  bookmarkController.bookmark.deleteBookmark
);

module.exports = router;
