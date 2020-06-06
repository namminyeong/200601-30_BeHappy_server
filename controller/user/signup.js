const { user, centerAdmin, center } = require('../../db/models');
const db = require('../../db/models');

const signupForUser = (req, res) => {
  const { username, password } = req.body;
  user
    .findOrCreate({
      where: {
        username: username,
      },
      defaults: {
        password: password,
      },
    })
    .spread((result, created) => {
      if (!created) {
        return res.status(409).json({
          errorCode: 3,
          message: 'username exists',
        });
      } else {
        res.status(200).send('complete signup!');
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const signupForCenter = async (req, res) => {
  const {
    username,
    password,
    latitude,
    longitude,
    centerName,
    businessNumber,
  } = req.body;

  db.sequelize.transaction().then(async (t) => {
    try {
      const resultPostCenter = await postCenter(
        t,
        latitude,
        longitude,
        centerName
      );

      const resultPostCenterAdmin = await postCenterAdmin(
        t,
        businessNumber,
        resultPostCenter.centerId
      );

      const resultPostUserForCenter = await PostUserForCenter(
        t,
        username,
        password,
        resultPostCenterAdmin.centerAdminId
      );

      t.commit();
      res.status(200).send(resultPostUserForCenter);
    } catch (err) {
      if (err.errorCode) {
        res.status(409).json(err);
      } else {
        res.status(400).send(err);
      }
    }
  });
};

const postCenter = (t, latitude, longitude, centerName) => {
  return new Promise((resolve, reject) => {
    center
      .findOrCreate({
        where: {
          latitude: latitude,
          longitude: longitude,
          centerName: centerName,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          return reject({
            errorCode: 4,
            message: 'center exists',
          });
        } else {
          return resolve({ centerId: result.id });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postCenterAdmin = (t, businessNumber, centerId) => {
  return new Promise((resolve, reject) => {
    centerAdmin
      .findOrCreate({
        where: {
          businessNumber: businessNumber,
        },
        defaults: {
          centerId: centerId,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          return reject({
            errorCode: 5,
            message: 'business number exists',
          });
        } else {
          return resolve({ centerAdminId: result.id });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const PostUserForCenter = (t, username, password, centerAdminId) => {
  return new Promise((resolve, reject) => {
    user
      .findOrCreate({
        where: {
          username: username,
        },
        defaults: {
          password: password,
          isCenterAdminPending: true,
          centerAdminId: centerAdminId,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          return reject({
            errorCode: 3,
            message: 'username exists',
          });
        } else {
          return resolve('complete signup!');
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  signupForUser: signupForUser,
  signupForCenter: signupForCenter,
};
