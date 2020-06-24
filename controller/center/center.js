const { center, specialty } = require('../../db/models');

const getCenterInfo = (req, res) => {
  const { centerId } = req.query;

  center
    .findOne({
      where: { id: centerId },
      include: [{ model: specialty }],
    })
    .then((data) => {
      if (data) {
        const result = {
          id: data.id,
          latitude: data.latitude,
          longitude: data.longitude,
          centerName: data.centerName,
          addressName: data.addressName,
          roadAddressName: data.roadAddressName,
          phone: data.phone,
          rateAvg: +data.rateAvg.toFixed(1),
          specialties: data.specialties.map((ele) => ele.name),
        };
        res.status(200).json(result);
      } else {
        res.status(403).json({ errorCode: 6, message: 'unvalid centerId' });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

module.exports = {
  getCenterInfo: getCenterInfo,
};
