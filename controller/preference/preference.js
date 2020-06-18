const {
  specialty,
  userAndSpecialty,
  kindOfCenter,
  userAndKindOfCenter,
  city,
  user,
  centerAndSpecialty,
  centerAdmin,
  center,
} = require('../../db/models');
const db = require('../../db/models');
const { Op } = require('sequelize');
const { syncSpecialtyFromReviewToCenter } = require('../review/review');

const postPreferenceForUser = async (req, res) => {
  const { userId, specialties, kindOfCenters, city } = req.body;

  db.sequelize.transaction().then(async (t) => {
    try {
      const resultFindSpecialties = await findSpecialties(t, specialties);
      let promisesSpecialty = [];
      for (let i = 0; i < resultFindSpecialties.length; i++) {
        promisesSpecialty.push(
          postUserAndSpecialty(t, userId, resultFindSpecialties[i])
        );
      }
      Promise.all(promisesSpecialty);

      const resultFindKindOfCenters = await findKindOfCenter(t, kindOfCenters);
      let promisesKindOfCenters = [];
      for (let i = 0; i < resultFindKindOfCenters.length; i++) {
        promisesKindOfCenters.push(
          postUserAndKindOfCenter(t, userId, resultFindKindOfCenters[i])
        );
      }
      Promise.all(promisesKindOfCenters);

      const resultFindCity = await findCity(t, city);
      await postCity(t, userId, resultFindCity);

      t.commit();
      res.status(200).json('complete post preference!');
    } catch (err) {
      res.status(400).json(err);
    }
  });
};

const postPreferenceForCenter = async (req, res) => {
  const { centerId, specialties } = req.body;

  db.sequelize.transaction().then(async (t) => {
    try {
      const resultFindSpecialties = await findSpecialties(t, specialties);
      let promisesSpecialty = [];
      for (let i = 0; i < resultFindSpecialties.length; i++) {
        promisesSpecialty.push(
          postCenterAndSpecialty(t, centerId, resultFindSpecialties[i])
        );
      }
      Promise.all(promisesSpecialty).then(() => {
        t.commit();
      });
      res.status(200).json('complete post preference!');
    } catch (err) {
      res.status(400).json(err);
    }
  });
};

const findSpecialties = (t, specialties) => {
  return new Promise((resolve, reject) => {
    specialty
      .findAll({
        attributes: ['id'],
        where: { name: { [Op.in]: specialties } },
        transaction: t,
      })
      .then((data) => {
        const ids = data.map((ele) => {
          return ele.id;
        });
        resolve(ids);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postUserAndSpecialty = (t, userId, specialtyId) => {
  return new Promise((resolve, reject) => {
    userAndSpecialty
      .findOrCreate({
        where: {
          userId: userId,
          specialtyId: specialtyId,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          console.log(
            `user and specialty exists. specialtyId : ${result.specialtyId}, userId : ${result.userId}`
          );
          return resolve(result);
        } else {
          return resolve(result);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const findKindOfCenter = (t, kindOfCenters) => {
  return new Promise((resolve, reject) => {
    kindOfCenter
      .findAll({
        attributes: ['id'],
        where: { name: { [Op.in]: kindOfCenters } },
        transaction: t,
      })
      .then((data) => {
        const ids = data.map((ele) => {
          return ele.id;
        });
        resolve(ids);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postUserAndKindOfCenter = (t, userId, kindOfCenterId) => {
  return new Promise((resolve, reject) => {
    userAndKindOfCenter
      .findOrCreate({
        where: {
          userId: userId,
          kindOfCenterId: kindOfCenterId,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          console.log(
            `user and KindOfCenter exists. kindOfCenterId : ${result.kindOfCenterId}, userId : ${result.userId}`
          );
          return resolve(result);
        } else {
          return resolve(result);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const findCity = (t, cityName) => {
  return new Promise((resolve, reject) => {
    city
      .findOrCreate({
        where: { name: cityName },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          console.log(`city exists : ${result.id}`);
          return resolve(result.id);
        } else {
          return resolve(result.id);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postCity = (t, userId, cityId) => {
  return new Promise((resolve, reject) => {
    user
      .update(
        {
          cityId: cityId,
        },
        {
          where: {
            id: userId,
          },
          transaction: t,
        }
      )
      .then((result) => {
        if (result[0] !== 0) {
          return resolve(`userId ${userId}'s cityId is changed`);
        } else {
          return resolve('nothing changed');
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postCenterAndSpecialty = (t, centerId, specialtyId) => {
  return new Promise((resolve, reject) => {
    centerAndSpecialty
      .findOrCreate({
        where: {
          centerId: centerId,
          specialtyId: specialtyId,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          console.log(
            `center and specialty exists. specialtyId : ${result.specialtyId}, centerId : ${result.centerId}`
          );
          return resolve(result);
        } else {
          return resolve(result);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getPreferenceForUser = (req, res) => {
  const { id } = req.decoded;
  user
    .findOne({
      attributes: ['id'],
      where: { id: id },
      include: [
        { model: specialty, attributes: ['name'] },
        { model: kindOfCenter, attributes: ['name'] },
        { model: city, attributes: ['name'] },
      ],
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getPreferenceForCenter = async (req, res) => {
  const { id } = req.decoded;

  const centerId = await getCenterIdByUserId(null, id);
  center
    .findOne({
      attributes: ['id'],
      where: { id: centerId },
      include: [{ model: specialty }],
    })
    .then((data) => {
      let results = data.specialties.map((ele) => ele.name);
      res.status(200).json({ specialties: results });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const patchPreferenceForUser = async (req, res) => {
  const { specialties, kindOfCenters, city } = req.body;
  const { id } = req.decoded;

  db.sequelize.transaction().then(async (t) => {
    try {
      await userAndSpecialty.destroy({
        where: {
          userId: id,
        },
        transaction: t,
      });
      const resultFindSpecialties = await findSpecialties(t, specialties);
      let promisesSpecialty = [];
      for (let i = 0; i < resultFindSpecialties.length; i++) {
        promisesSpecialty.push(
          postUserAndSpecialty(t, id, resultFindSpecialties[i])
        );
      }
      Promise.all(promisesSpecialty);

      await userAndKindOfCenter.destroy({
        where: {
          userId: id,
        },
        transaction: t,
      });
      const resultFindKindOfCenters = await findKindOfCenter(t, kindOfCenters);
      let promisesKindOfCenters = [];
      for (let i = 0; i < resultFindKindOfCenters.length; i++) {
        promisesKindOfCenters.push(
          postUserAndKindOfCenter(t, id, resultFindKindOfCenters[i])
        );
      }
      Promise.all(promisesKindOfCenters);

      const resultFindCity = await findCity(t, city);
      await postCity(t, id, resultFindCity);

      t.commit();
      res.status(200).json('complete modify preference!');
    } catch (err) {
      res.status(400).json(err);
    }
  });
};

const patchPreferenceForCenter = (req, res) => {
  const { specialties } = req.body;
  const { id } = req.decoded;

  db.sequelize.transaction().then(async (t) => {
    try {
      const centerId = await getCenterIdByUserId(t, id);
      await centerAndSpecialty.destroy({
        where: {
          centerId: centerId,
        },
        transaction: t,
      });

      const resultFindSpecialties = await findSpecialties(t, specialties);
      let promisesSpecialty = [];
      for (let i = 0; i < resultFindSpecialties.length; i++) {
        promisesSpecialty.push(
          postCenterAndSpecialty(t, centerId, resultFindSpecialties[i])
        );
      }
      Promise.all(promisesSpecialty).then(async () => {
        await syncSpecialtyFromReviewToCenter(t, centerId);
        t.commit();
      });

      res.status(200).json('complete modify preference!');
    } catch (err) {
      res.status(400).json(err);
    }
  });
};

const getCenterIdByUserId = (t, userId) => {
  return new Promise((resolve, reject) => {
    user
      .findOne({
        attributes: ['id'],
        where: { id: userId },
        include: [
          {
            model: centerAdmin,
            attributes: ['id'],
            include: [
              {
                model: center,
                attributes: ['id'],
              },
            ],
          },
        ],
        transaction: t,
      })
      .then((data) => {
        resolve(data.centerAdmin.center.id);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  postPreferenceForUser: postPreferenceForUser,
  postPreferenceForCenter: postPreferenceForCenter,
  getPreferenceForUser: getPreferenceForUser,
  getPreferenceForCenter: getPreferenceForCenter,
  patchPreferenceForUser: patchPreferenceForUser,
  patchPreferenceForCenter: patchPreferenceForCenter,
};
