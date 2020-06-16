require('dotenv').config();
const axios = require('axios');
const {
  center,
  specialty,
  user,
  review,
  anonymousUser,
  kindOfCenter,
  city,
} = require('../../db/models');

const searchByLocation = async (req, res) => {
  const { latitude, longitude, radius, tags } = req.query;
  const { id } = req.decoded;
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
    Promise.all(promises).then(async (results) => {
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
      res.status(200).json(await getImportance(result, id));
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const searchByName = async (req, res) => {
  const { keyword, tags } = req.query;
  const { id } = req.decoded;
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
    Promise.all(promises).then(async (results) => {
      let result = {};
      result['counseling'] = filterCentersWithTags(
        results.slice(0, counselingCenters.length),
        tagArr
      );
      result['psychiatric'] = filterCentersWithTags(
        results.slice(counselingCenters.length),
        tagArr
      );
      res.status(200).json(await getImportance(result, id));
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
        const prettierResult = {
          id: result.id,
          latitude: result.latitude,
          longitude: result.longitude,
          centerName: result.centerName,
          addressName: result.addressName,
          roadAddressName: result.roadAddressName,
          phone: result.phone,
          rateAvg: result.rateAvg,
          specialties: result.specialties
            ? result.specialties.map((ele) => {
                return {
                  name: ele.name,
                };
              })
            : [],
        };
        if (!created) {
          console.log('center exists :', result.id);
          return resolve(prettierResult);
        } else {
          return resolve(prettierResult);
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

const getImportance = async (centers, userId) => {
  const userSpetialties = await getUserSpecialties(userId);
  const userKindOfCenters = await getUserKindOfCenters(userId);
  const userCityName = await getCityName(userId);
  const cityNames = userCityName.split(' ');

  for (let index = 0; index < centers.counseling.length; index++) {
    let ele = centers.counseling[index];
    const importance = await getImportanceByCenter(
      ele,
      '심리상담소',
      userSpetialties,
      userKindOfCenters,
      cityNames
    );
    ele['importance'] = Math.floor(importance);
  }

  for (let index = 0; index < centers.psychiatric.length; index++) {
    let ele = centers.psychiatric[index];
    const importance = await getImportanceByCenter(
      ele,
      '정신과',
      userSpetialties,
      userKindOfCenters,
      cityNames
    );
    ele['importance'] = Math.floor(importance);
  }

  return centers;
};

const getImportanceByCenter = async (
  center,
  kindOfCenter,
  userSpetialties,
  userKindOfCenters,
  cityNames
) => {
  let importance = 0;
  for (let i = 0; i < center.specialties.length; i++) {
    if (userSpetialties.includes(center.specialties[i].name)) {
      importance += 0.5;
      break;
    }
  }
  if (userKindOfCenters.includes(kindOfCenter)) {
    importance += 0.5;
  }
  for (let i = 0; i < cityNames.length; i++) {
    if (center.addressName.includes(cityNames[i])) {
      importance += 0.5;
      break;
    }
  }
  const reviews = await getReviewByCenterId(center.id);
  if (reviews.length >= 3 && center.rateAvg >= 4) {
    importance += 0.5;
  }
  return importance;
};

const getUserSpecialties = (userId) => {
  return new Promise((resolve, reject) => {
    user
      .findOne({
        where: { id: userId },
        include: [{ model: specialty }],
      })
      .then((data) => {
        const result = data.specialties.map((ele) => ele.name);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getUserKindOfCenters = (userId) => {
  return new Promise((resolve, reject) => {
    user
      .findOne({
        where: { id: userId },
        include: [{ model: kindOfCenter }],
      })
      .then((data) => {
        const result = data.kindOfCenters.map((ele) => ele.name);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getCityName = (userId) => {
  return new Promise((resolve, reject) => {
    user
      .findOne({
        where: { id: userId },
        include: [{ model: city }],
      })
      .then((data) => {
        if (data.city) {
          resolve(data.city.name);
        } else {
          resolve('');
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getReviewByCenterId = (centerId) => {
  return new Promise((resolve, reject) => {
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
        const results = data.map((ele) => ele.id);
        resolve(results);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  searchByLocation: searchByLocation,
  searchByName: searchByName,
  searchCentersForAddress: searchCentersForAddress,
};
