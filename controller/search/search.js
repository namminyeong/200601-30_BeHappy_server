require('dotenv').config();
const axios = require('axios');
const { center, specialty } = require('../../db/models');

const searchByLocation = async (req, res) => {
  const { latitude, longitude, radius, tags } = req.query;
  const tagArr = tags ? tags.split(',') : '';
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

    const targetCenters = counselingCenters.documents.concat(
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
      result['counseling'] = filterCentersWithTags(
        results.slice(0, counselingCenters.documents.length),
        tagArr
      );
      result['psychiatric'] = filterCentersWithTags(
        results.slice(counselingCenters.documents.length),
        tagArr
      );
      res.status(200).json(result);
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const searchByName = async (req, res) => {
  const { keyword, tags } = req.query;
  const tagArr = tags ? tags.split(',') : '';
  try {
    const searchingResult = await getCentersFromKaKao(
      null,
      null,
      null,
      encodeURIComponent(keyword)
    );

    const counselingCenters = searchingResult.documents.filter((ele) => {
      return ele.category_name.includes('상담');
    });

    const PsychiatricHospitals = searchingResult.documents.filter((ele) => {
      return ele.category_name.includes('정신건강의학과');
    });

    const targetCenters = counselingCenters.concat(PsychiatricHospitals);

    let promises = [];
    for (let i = 0; i < targetCenters.length; i++) {
      promises.push(postCenterInfo(targetCenters[i]));
    }
    Promise.all(promises).then((results) => {
      let result = {};
      result['counseling'] = filterCentersWithTags(
        results.slice(0, counselingCenters.length),
        tagArr
      );
      result['psychiatric'] = filterCentersWithTags(
        results.slice(counselingCenters.length),
        tagArr
      );
      res.status(200).json(result);
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const getCentersFromKaKao = (y, x, radius = 20000, encodedKeyword) => {
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
        include: [{ model: specialty, attributes: ['name'] }],
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
          console.log('center exists :', result.id);
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

const filterCentersWithTags = (centers, tags) => {
  if (!tags) return centers;
  const result = centers.filter((ele) => {
    if (!ele.specialties) return false;
    for (let i = 0; i < ele.specialties.length; i++) {
      if (tags.includes(ele.specialties[i].name)) return true;
    }
    return false;
  });
  return result;
};

const searchCentersForAddress = async (req, res) => {
  const { latitude, longitude } = req.query;
  let radius = 20000;
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

    const targetCenters = counselingCenters.documents.concat(
      PsychiatricHospitals.documents
    );

    const results = targetCenters.map((ele) => {
      return {
        latitude: ele.y,
        longitude: ele.x,
        centerName: ele.place_name,
        addressName: ele.address_name,
        roadAddressName: ele.road_address_name,
        phone: ele.phone,
      };
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports = {
  searchByLocation: searchByLocation,
  searchByName: searchByName,
  searchCentersForAddress: searchCentersForAddress,
};
