const { user, centerAdmin, center } = require('../../db/models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  login: (req, res) => {
    const { username, password } = req.body;
    var shasum = crypto.createHash(process.env.TOKEN_HASH);
    shasum.update(password);
    let encryptedPassword = shasum.digest('hex');

    user
      .findOne({
        where: {
          username: username,
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
        if (!data) {
          return res
            .status(403)
            .json({
              errorCode: 1,
              message: 'unvalid user',
            })
            .send('unvalid user');
        } else if (encryptedPassword !== data.password) {
          return res.status(403).json({
            errorCode: 2,
            message: 'wrong password',
          });
        }

        let token = jwt.sign(
          { id: data.id, username: username },
          process.env.TOKEN_SECRET_KEY,
          {
            expiresIn: '24h', // expires in 24 hours
          }
        );

        let adminState = data.centerAdminId
          ? !data.isCenterAdminPending
            ? 1
            : -1
          : 0;

        let name = data.centerAdmin
          ? data.centerAdmin.center.centerName
          : data.nickname;
        let phone = data.centerAdmin
          ? data.centerAdmin.center.phone
          : data.phone;

        res
          .cookie('token', token)
          .status(200)
          .json({
            token: token,
            adminState: adminState,
            userInfo: {
              id: data.id,
              name: name,
              phone: phone,
            },
          });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
