const express = require('express');
const router = express.Router();
const utils = require('../modules/utils');
const { bookingController } = require('../controller');

// * POST /booking
router.post('/', utils.checkToken, bookingController.booking.postBooking);

// * GET /booking
router.get(
  '/',
  utils.checkToken,
  bookingController.booking.getBookingListByUserId
);

// * GET /booking/center // 센터페이지에서 예약 리스트 가져오는 것, 상세페이지에서 예약 정보 가져오는 것 둘 다 대응 가능?
router.get(
  '/center',
  utils.checkToken,
  bookingController.booking.getBookingListByCenterId
);

// * PATCH /booking/check
router.patch(
  '/check',
  utils.checkToken,
  bookingController.booking.checkBooking
);

// * PATCH /booking
router.patch('/', utils.checkToken, bookingController.booking.modifyBooking);

// * DELETE /booking

module.exports = router;
