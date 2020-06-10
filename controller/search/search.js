require('dotenv').config();
const axios = require('axios');
const { center } = require('../../db/models');

const searchByLocation = async (req, res) => {
  const { latitude, longitude, radius } = req.query;
  try {
    const counselingCenters = await getCentersFromKaKao(
      latitude,
      longitude,
      radius,
      encodeURIComponent('심리상담소')
    );
    const PsychiatricHospitals = await getCentersFromKaKao(
      latitude,
      longitude,
      radius,
      encodeURIComponent('정신과')
    );

    let targetCenters = counselingCenters.documents.concat(
      PsychiatricHospitals.documents
    );
    let promises = [];
    for (let i = 0; i < targetCenters.length; i++) {
      promises.push(postCenterInfo(targetCenters[i]));
    }
    Promise.all(promises).then((results) => {
      for (let i = 0; i < results.length; i++) {
        results[i]['distance'] = targetCenters[i].distance;
      }
      let result = {};
      result['counseling'] = results.slice(
        0,
        counselingCenters.documents.length
      );
      result['psychiatric'] = results.slice(counselingCenters.documents.length);
      res.status(200).json(result);
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const searchByName = async (req, res) => {
  const { keyword } = req.query;
  try {
    const searchingResult = await getCentersFromKaKao(
      null,
      null,
      null,
      encodeURIComponent(keyword)
    );

    let targetCenters = searchingResult.documents.filter((ele) => {
      return (
        ele.category_name.includes('상담') ||
        ele.category_name.includes('정신건강의학과')
      );
    });

    let promises = [];
    for (let i = 0; i < targetCenters.length; i++) {
      promises.push(postCenterInfo(targetCenters[i]));
    }
    Promise.all(promises).then((results) => {
      res.status(200).json(results);
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const getCentersFromKaKao = (y, x, radius, encodedKeyword) => {
  let paramURL = y
    ? `y=${y}&x=${x}&radius=${radius}&query=${encodedKeyword}`
    : `query=${encodedKeyword}`;
  return new Promise((resolve, reject) => {
    axios
      .get(`https://dapi.kakao.com/v2/local/search/keyword.json?${paramURL}`, {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_RESTAPI_KEY}`,
        },
      })
      .then((result) => {
        resolve(result.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const postCenterInfo = (rawInfo) => {
  const { y, x, phone, address_name, road_address_name, place_name } = rawInfo;
  return new Promise((resolve, reject) => {
    center
      .findOrCreate({
        where: {
          roadAddressName: road_address_name,
          centerName: place_name,
        },
        defaults: {
          latitude: y,
          longitude: x,
          addressName: address_name,
          phone: phone,
        },
      })
      .spread((result, created) => {
        if (!created) {
          console.log('center exists :', result.dataValues.id);
          return resolve(result.dataValues);
        } else {
          return resolve(result.dataValues);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  searchByLocation: searchByLocation,
  searchByName: searchByName,
};
