/* eslint-disable no-prototype-builtins */
const { review } = require('../../db/models');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

const getReviewAnalysis = async (req, res) => {
  const { startDate, endDate } = req.query;

  const allReviews = await findAllReviewWithinPeriod(startDate, endDate);

  const reviewCountOfEachMonth = {};
  const rateAvgOfEachMonth = {};
  const reviewCountOfEachRate = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  allReviews.forEach((ele) => {
    const yearMonth = moment(ele.date).format('YYYY-MM');

    if (!reviewCountOfEachMonth.hasOwnProperty(yearMonth)) {
      reviewCountOfEachMonth[yearMonth] = 0;
    }
    reviewCountOfEachMonth[yearMonth]++;

    if (!rateAvgOfEachMonth.hasOwnProperty(yearMonth)) {
      rateAvgOfEachMonth[yearMonth] = 0;
    }
    rateAvgOfEachMonth[yearMonth] = cumulativeAverage(
      rateAvgOfEachMonth[yearMonth],
      ele.rate,
      reviewCountOfEachMonth[yearMonth]
    );

    reviewCountOfEachRate[ele.rate]++;
  });

  const rateAvgs = Object.values(rateAvgOfEachMonth);
  const totalAvgOfAvgs = rateAvgs.reduce((pre, cur) => pre + cur);

  res.status(200).json({
    reviewCountOfEachMonth: reviewCountOfEachMonth,
    rateAvgOfEachMonth: rateAvgOfEachMonth,
    reviewCountOfEachRate: reviewCountOfEachRate,
    totalAvg: +(totalAvgOfAvgs / rateAvgs.length).toFixed(1),
  });
};

const findAllReviewWithinPeriod = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    review
      .findAll({
        attributes: ['id', 'rate', 'date'],
        where: {
          date: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
          isDeleted: false,
        },
        order: [['date', 'ASC']],
      })
      .then((data) => {
        const result = data.map((ele) => {
          return { id: ele.id, rate: ele.rate, date: ele.date };
        });
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const cumulativeAverage = (prevRateAvg, newRate, reviewLength) => {
  const oldWeight = (reviewLength - 1) / reviewLength;
  const newWeight = 1 / reviewLength;
  return prevRateAvg * oldWeight + newRate * newWeight;
};

module.exports = {
  getReviewAnalysis: getReviewAnalysis,
};
