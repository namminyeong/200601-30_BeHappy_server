const { booking } = require('../../db/models');
const moment = require('moment');

const postBooking = (req, res) => {
  const { centerId, date, time, name, phone, content } = req.body;
  const { id } = req.decoded;

  booking
    .findOrCreate({
      where: {
        date: date,
        time: time,
        isDeleted: false,
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
        isDeleted: false,
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
        isDeleted: false,
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

const checkBooking = async (req, res) => {
  const { bookingId, isCheck } = req.body;

  booking
    .update(
      {
        bookingState: isCheck ? 'used' : 'notUsed',
        usedDate: isCheck ? moment().format('YYYY-MM-DD') : null,
        usedTime: isCheck ? moment().format('HH:mm:ss') : null,
      },
      {
        where: {
          id: bookingId,
          isDeleted: false,
        },
      }
    )
    .then((result) => {
      if (result[0] !== 0) {
        res
          .status(200)
          .json(`bookingId ${bookingId}'s bookingState is changed`);
      } else {
        res.status(200).json('nothing changed');
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const reviewBooking = (t, bookingId) => {
  return new Promise((resolve, reject) => {
    booking
      .update(
        {
          bookingState: 'reviewed',
        },
        {
          where: {
            id: bookingId,
            isDeleted: false,
          },
          transaction: t,
        }
      )
      .then((result) => {
        if (result[0] !== 0) {
          resolve(`bookingId ${bookingId}'s bookingState is changed`);
        } else {
          resolve('nothing changed');
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const modifyBooking = (req, res) => {
  const { bookingId, date, time, name, phone, content } = req.body;

  booking
    .update(
      {
        date: date,
        time: time,
        name: name,
        phone: phone,
        content: content,
      },
      {
        where: {
          id: bookingId,
          isDeleted: false,
        },
      }
    )
    .then((result) => {
      if (result[0] !== 0) {
        res.status(200).json(`bookingId ${bookingId} is modified`);
      } else {
        res.status(200).json('nothing changed');
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const deleteBooking = (req, res) => {
  const { bookingId } = req.body;
  booking
    .update(
      {
        isDeleted: true,
      },
      {
        where: {
          id: bookingId,
        },
      }
    )
    .then((result) => {
      if (result[0] !== 0) {
        res.status(200).json(`bookingId ${bookingId} is deleted`);
      } else {
        res.status(200).json('nothing changed');
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
  checkBooking: checkBooking,
  reviewBooking: reviewBooking,
  modifyBooking: modifyBooking,
  deleteBooking: deleteBooking,
};
