const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { searchController } = require('../controller');

// * GET /search
router.get('/', searchController.search.searchCentersForAddress);

// * GET /search/location
router.get(
  '/location',
  utils.checkToken,
  searchController.search.searchByLocation
);

// * GET /search/name
router.get('/name', utils.checkToken, searchController.search.searchByName);

module.exports = router;
