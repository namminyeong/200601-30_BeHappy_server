const { bookmark } = require('../../db/models');

const postBookmark = async (req, res) => {
  const { centerId } = req.body;
  const { id } = req.decoded;

  bookmark
    .findOrCreate({
      where: {
        userId: id,
        centerId: centerId,
      },
    })
    .spread((result, created) => {
      if (!created) {
        console.log(
          `bookmark exists. centerId : ${result.centerId}, userId : ${result.userId}`
        );
        res.status(200).json('complete post bookmark!');
      } else {
        res.status(200).json('complete post bookmark!');
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports = {
  postBookmark: postBookmark,
};
