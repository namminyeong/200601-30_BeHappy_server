const {
  anonymousUser,
  review,
  reviewAndSpecialty,
  specialty,
  center,
} = require('../../db/models');
const db = require('../../db/models');
const { Op } = require('sequelize');

const postReview = (req, res) => {
  const { centerId, rate, content, specialties } = req.body;
  const { id } = req.decoded;

  db.sequelize.transaction().then(async (t) => {
    try {
      const resultAnonymousUser = await findOrCreateAnonymousUser(
        t,
        id,
        centerId
      );
      const resultReview = await createReview(
        t,
        rate,
        content,
        resultAnonymousUser.id
      );

      const resultFindSpecialties = await findSpecialties(t, specialties);
      let promises = [];
      for (let i = 0; i < resultFindSpecialties.length; i++) {
        promises.push(
          postReviewAndSpecialty(t, centerId, resultFindSpecialties[i])
        );
      }
      Promise.all(promises).then(() => {
        t.commit();
      });
      res.status(200).json(resultReview);
    } catch (err) {
      res.status(400).json(err);
    }
  });
};

const findOrCreateAnonymousUser = (t, userId, centerId) => {
  return new Promise((resolve, reject) => {
    anonymousUser
      .findOne({
        where: {
          userId: userId,
          centerId: centerId,
        },
        transaction: t,
      })
      .then(async (data) => {
        if (data) {
          resolve(data);
        } else {
          const anonymousNameList = await findAnonymousUserByCenterId(
            t,
            centerId
          );
          let i = 0;
          let targetName = makeAnonymousName();
          while (i++ < 100) {
            if (!anonymousNameList.includes(targetName)) {
              break;
            }
          }
          const result = await createAnonymousUser(
            t,
            userId,
            centerId,
            targetName
          );
          resolve(result);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const findAnonymousUserByCenterId = (t, centerId) => {
  return new Promise((resolve, reject) => {
    anonymousUser
      .findAll({
        where: {
          centerId: centerId,
        },
        transaction: t,
      })
      .then((data) => {
        const result = data.map((ele) => {
          return ele.name;
        });
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createAnonymousUser = (t, userId, centerId, anonymousName) => {
  return new Promise((resolve, reject) => {
    anonymousUser
      .create(
        {
          userId: userId,
          centerId: centerId,
          anonymousName: anonymousName,
        },
        {
          transaction: t,
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const makeAnonymousName = () => {
  const adjectiveList = [
    '춤추는',
    '노래하는',
    '신나는',
    '사랑스러운',
    '들썩이는',
    '씩씩한',
    '용기있는',
    '리듬타는',
  ];
  const nounList = ['고양이', '고래', '곰', '토끼', '다람쥐', '호랑이', '하마'];
  const randomAdjectiveIdx = Math.floor(Math.random() * adjectiveList.length);
  const randomNounIdx = Math.floor(Math.random() * nounList.length);
  return `${adjectiveList[randomAdjectiveIdx]} ${nounList[randomNounIdx]}`;
};

const createReview = (t, rate, content, anonymousUserId) => {
  return new Promise((resolve, reject) => {
    review
      .create(
        {
          rate: rate,
          content: content,
          anonymousUserId: anonymousUserId,
        },
        {
          transaction: t,
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postReviewAndSpecialty = (t, reviewId, specialtyId) => {
  return new Promise((resolve, reject) => {
    reviewAndSpecialty
      .findOrCreate({
        where: {
          reviewId: reviewId,
          specialtyId: specialtyId,
        },
        transaction: t,
      })
      .spread((result, created) => {
        if (!created) {
          console.log(
            `review and specialty exists. specialtyId : ${result.specialtyId}, reviewId : ${result.reviewId}`
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

const getReviewByUserId = (req, res) => {
  const { id } = req.decoded;

  review
    .findAll({
      include: [
        {
          model: anonymousUser,
          where: { userId: id },
          include: [{ model: center, include: [{ model: specialty }] }],
        },
      ],
    })
    .then((data) => {
      const results = data.map((ele) => {
        return {
          reviewId: ele.id,
          date: ele.date, // 진료날짜로 바꿔야 하나?
          rate: ele.rate,
          content: ele.content,
          anonymousName: ele.anonymousUser.anonymousName,
          centerName: ele.anonymousUser.center.centerName,
          specialties: ele.anonymousUser.center.specialties.map((ele2) => {
            return {
              name: ele2.name,
            };
          }),
        };
      });
      res.status(200).json(results);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getReviewByCenterId = (req, res) => {
  const { centerId } = req.query;

  review
    .findAll({
      include: [
        {
          model: anonymousUser,
          where: { centerId: centerId },
          include: [{ model: center, include: [{ model: specialty }] }],
        },
      ],
    })
    .then((data) => {
      const results = data.map((ele) => {
        return {
          reviewId: ele.id,
          date: ele.date, // 진료날짜로 바꿔야 하나?
          rate: ele.rate,
          content: ele.content,
          anonymousName: ele.anonymousUser.anonymousName,
          centerName: ele.anonymousUser.center.centerName,
          specialties: ele.anonymousUser.center.specialties.map((ele2) => {
            return {
              name: ele2.name,
            };
          }),
        };
      });
      res.status(200).json(results);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports = {
  postReview: postReview,
  getReviewByUserId: getReviewByUserId,
  getReviewByCenterId: getReviewByCenterId,
};
