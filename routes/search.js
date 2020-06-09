const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { searchController } = require('../controller');

// * GET /search/location
router.get(
  '/location',
  utils.checkToken,
  searchController.location.searchByLocation
);

// * GET /search/name
router.get('/name', utils.checkToken, searchController.name.searchByName);

module.exports = router;
