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

module.exports = {
  postBooking: postBooking,
};
