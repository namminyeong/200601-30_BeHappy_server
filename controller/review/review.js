const {
  anonymousUser,
  review,
  reviewAndSpecialty,
  specialty,
  center,
} = require('../../db/models');
const db = require('../../db/models');
const { Op } = require('sequelize');
const { postCenterAndSpecialty } = require('../preference/preference');

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
          postReviewAndSpecialty(t, resultReview.id, resultFindSpecialties[i])
        );
      }
      Promise.all(promises).then(async () => {
        await syncSpecialtyFromReviewToCenter(t, centerId);

        const resultArrayOfReview = await getArrayOfReviewByCenterId(
          t,
          centerId
        );
        await applyRateAvgOnCenter(
          t,
          centerId,
          resultArrayOfReview[0].centerRateAvg,
          rate,
          resultArrayOfReview.length
        );
        t.commit();
      });

      res.status(200).json(resultReview);
    } catch (err) {
      res.status(400).json(err);
    }
  });
};

const applyRateAvgOnCenter = (t, centerId, prevAvg, newRate, listLength) => {
  return new Promise((resolve, reject) => {
    const oldWeight = (listLength - 1) / listLength;
    const newWeight = 1 / listLength;
    const newAvg = prevAvg * oldWeight + newRate * newWeight;
    center
      .update(
        {
          rateAvg: newAvg,
        },
        {
          where: { id: centerId },
          transaction: t,
        }
      )
      .then((result) => {
        if (result[0] !== 0) {
          console.log(
            `centerId ${centerId}'s rateAvg is changed with ${newAvg}`
          );
        } else {
          console.log('nothing changed');
        }
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getArrayOfReviewByCenterId = (t, centerId) => {
  return new Promise((resolve, reject) => {
    review
      .findAll({
        include: [
          {
            model: anonymousUser,
            where: { centerId: centerId },
            include: [{ model: center }],
          },
          { model: specialty },
        ],
        transaction: t,
      })
      .then((data) => {
        const results = data.map((ele) => {
          return {
            reviewId: ele.id,
            centerRateAvg: ele.anonymousUser.center.rateAvg,
            specialties: ele.specialties.map((ele2) => ele2.id),
          };
        });
        resolve(results);
      })
      .catch((err) => {
        reject(err);
      });
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
    '와글와글',
    '우르르쾅쾅',
    '번쩍이는',
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
          include: [{ model: center }],
        },
        { model: specialty },
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
          specialties: ele.specialties.map((ele2) => {
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

const syncSpecialtyFromReviewToCenter = async (t, centerId) => {
  const resultArrayOfReview = await getArrayOfReviewByCenterId(t, centerId);
  const setTotalSpecialties = resultArrayOfReview.reduce((pre, cur) => {
    cur.specialties.forEach((ele) => {
      pre.add(ele);
    });
    return pre;
  }, new Set([]));
  const arrTotalSpecialties = Array.from(setTotalSpecialties);

  let promises = [];
  for (let i = 0; i < arrTotalSpecialties.length; i++) {
    promises.push(postCenterAndSpecialty(t, centerId, arrTotalSpecialties[i]));
  }
  Promise.all(promises);
};

module.exports = {
  postReview: postReview,
  getReviewByUserId: getReviewByUserId,
  getReviewByCenterId: getReviewByCenterId,
  syncSpecialtyFromReviewToCenter: syncSpecialtyFromReviewToCenter,
};
