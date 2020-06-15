//const { bookmark, user, center, specialty } = require('../../db/models');

const postReview = (req, res) => {
  // const { centerId } = req.body;
  // const { id } = req.decoded;

  res.status(200).json('post review');
};

module.exports = {
  postReview: postReview,
};
