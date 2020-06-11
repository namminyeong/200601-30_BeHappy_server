require('dotenv').config();
const { user, centerAdmin, center } = require('../../db/models');

const getAdminRequest = async (req, res) => {
  user
    .findAll({
      where: {
        isCenterAdminPending: true,
      },
      include: [
        {
          model: centerAdmin,
          include: [
            {
              model: center,
            },
          ],
        },
      ],
    })
    .then((data) => {
      let results = data.map((ele) => {
        return {
          userId: ele.id,
          username: ele.username,
          centerName: ele.centerAdmin.center.centerName,
        };
      });
      res.status(200).json(results);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const postAdminRequest = async (req, res) => {
  const { userId } = req.body;
  user
    .update(
      {
        isCenterAdminPending: false,
      },
      {
        where: {
          id: userId,
          centerAdminId: { ne: null },
        },
      }
    )
    .then((result) => {
      if (result[0] !== 0) {
        res
          .status(200)
          .send(`userId ${userId}'s isCenterAdminPending is changed`);
      } else {
        res.status(200).send('nothing changed');
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

module.exports = {
  getAdminRequest: getAdminRequest,
  postAdminRequest: postAdminRequest,
};
