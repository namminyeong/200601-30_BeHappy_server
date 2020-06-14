const {
  specialty,
  userAndSpecialty,
  kindOfCenter,
  userAndKindOfCenter,
  city,
  user,
  centerAndSpecialty,
} = require('../../db/models');
const db = require('../../db/models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

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

module.exports = {
  postPreferenceForUser: postPreferenceForUser,
  postPreferenceForCenter: postPreferenceForCenter,
};
