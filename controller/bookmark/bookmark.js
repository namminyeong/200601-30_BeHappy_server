const { bookmark, user, center } = require('../../db/models');

const postBookmark = (req, res) => {
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

const deleteBookmark = async (req, res) => {
  const { centerId } = req.body;
  const { id } = req.decoded;

  let result = await bookmark.destroy({
    where: {
      userId: id,
      centerId: centerId,
    },
  });

  if (result) {
    res.status(200).json('complete delete bookmark!');
  } else {
    res.status(200).json('there is no record for it');
  }
};

const getBookmark = async (req, res) => {
  const { id } = req.decoded;

  user
    .findOne({
      attributes: ['id'],
      where: { id: id },
      include: [{ model: center }],
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports = {
  postBookmark: postBookmark,
  deleteBookmark: deleteBookmark,
  getBookmark: getBookmark,
};
