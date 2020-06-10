const { user } = require('../../db/models');
module.exports = {
  checkAuthorization: (req, res) => {
    const { id } = req.decoded;
    user
      .findOne({
        where: {
          id: id,
        },
      })
      .then((data) => {
        if (!data) {
          res.status(403).json({
            errorCode: 1,
            message: 'unvalid user',
          });
        } else {
          res.status(200).json({
            id: data.id,
            isAdmin:
              data.centerAdminId && !data.isCenterAdminPending ? true : false,
          });
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
