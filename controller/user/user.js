const { user, centerAdmin, center } = require('../../db/models');

const getUserInfo = (req, res) => {
  const { id } = req.decoded;

  user
    .findOne({
      attributes: ['id', 'nickname', 'phone'],
      where: { id: id },
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getCenterAdminInfo = (req, res) => {
  const { id } = req.decoded;

  user
    .findOne({
      attributes: ['id'],
      where: { id: id },
      include: [
        {
          model: centerAdmin,
          attributes: ['id'],
          include: [{ model: center }],
        },
      ],
    })
    .then((data) => {
      res.status(200).json(data.centerAdmin.center);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports = {
  getUserInfo: getUserInfo,
  getCenterAdminInfo: getCenterAdminInfo,
};
