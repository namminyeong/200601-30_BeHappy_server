const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { bookingController } = require('../controller');

// * POST /booking
router.post('/', utils.checkToken, bookingController.booking.postBooking);

// * GET /booking
// * GET /booking/center // 센터페이지에서 예약 리스트 가져오는 것, 상세페이지에서 예약 정보 가져오는 것 둘 다 대응 가능?
// * PATCH /booking
// * DELETE /booking
// * POST /booking/treatment

module.exports = router;
