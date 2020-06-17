const { bookmark, user, center, specialty } = require('../../db/models');

const postBookmark = (req, res) => {
  const { centerId } = req.body;
  const { id } = req.decoded;

  bookmark
    .findOrCreate({
      where: {
        userId: id,
        centerId: centerId,
      },
    })
    .spread(async (result, created) => {
      const center = await findCenter(result.centerId);
      if (!created) {
        console.log(
          `bookmark exists. centerId : ${result.centerId}, userId : ${result.userId}`
        );
        res.status(200).json(center);
      } else {
        res.status(200).json(center);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const deleteBookmark = async (req, res) => {
  const { centerId } = req.body;
  const { id } = req.decoded;

  let result = await bookmark.destroy({
    where: {
      userId: id,
      centerId: centerId,
    },
  });

  if (result) {
    res.status(200).json('complete delete bookmark!');
  } else {
    res.status(200).json('there is no record for it');
  }
};

const getBookmark = async (req, res) => {
  const { id } = req.decoded;

  user
    .findOne({
      attributes: ['id'],
      where: { id: id },
      include: [{ model: center, include: [{ model: specialty }] }],
    })
    .then((data) => {
      const newCenters = data.centers.map((ele) => {
        return {
          id: ele.id,
          latitude: ele.latitude,
          longitude: ele.longitude,
          centerName: ele.centerName,
          addressName: ele.addressName,
          roadAddressName: ele.roadAddressName,
          phone: ele.phone,
          rateAvg: ele.rateAvg,
          specialties: ele.specialties.map((ele2) => {
            return {
              name: ele2.name,
            };
          }),
        };
      });
      res.status(200).json({ centers: newCenters });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

// center.js에 있는 걸 사용하도록 리팩토링
const findCenter = (centerId) => {
  return new Promise((resolve, reject) => {
    center
      .findOne({
        where: { id: centerId },
        include: [{ model: specialty }],
      })
      .then((data) => {
        resolve({
          id: data.id,
          latitude: data.latitude,
          longitude: data.longitude,
          centerName: data.centerName,
          addressName: data.addressName,
          roadAddressName: data.roadAddressName,
          phone: data.phone,
          rateAvg: data.rateAvg,
          specialties: data.specialties.map((ele) => {
            return {
              name: ele.name,
            };
          }),
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  postBookmark: postBookmark,
  deleteBookmark: deleteBookmark,
  getBookmark: getBookmark,
};
