const { booking } = require('../../db/models');

const postBooking = (req, res) => {
  const { centerId, date, time, name, phone, content } = req.body;
  const { id } = req.decoded;

  booking
    .findOrCreate({
      where: {
        date: date,
        time: time,
      },
      defaults: {
        name: name,
        phone: phone,
        content: content,
        userId: id,
        centerId: centerId,
      },
    })
    .spread((result, created) => {
      if (!created) {
        console.log(
          `bookmark exists. centerId : ${result.centerId}, userId : ${result.userId}`
        );
        res.status(403).json({
          errorCode: 7,
          message: 'booking already exists at that time.',
        });
      } else {
        res.status(200).json(result);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getBookingListByUserId = (req, res) => {
  const { date } = req.query;
  const { id } = req.decoded;

  booking
    .findAll({
      attributes: [
        'id',
        'date',
        'time',
        'name',
        'phone',
        'content',
        'bookingState',
        'usedDate',
        'usedTime',
      ],
      where: {
        userId: id,
        date: date,
      },
    })
    .then((data) => {
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(403).json({
          errorCode: 8,
          message: 'there is no booking by userId.',
        });
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getBookingListByCenterId = (req, res) => {
  const { centerId, date } = req.query;

  booking
    .findAll({
      attributes: [
        'id',
        'date',
        'time',
        'name',
        'phone',
        'content',
        'bookingState',
        'usedDate',
        'usedTime',
      ],
      where: {
        centerId: centerId,
        date: date,
      },
    })
    .then((data) => {
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(403).json({
          errorCode: 9,
          message: 'there is no booking by centerId.',
        });
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports = {
  postBooking: postBooking,
  getBookingListByUserId: getBookingListByUserId,
  getBookingListByCenterId: getBookingListByCenterId,
};
