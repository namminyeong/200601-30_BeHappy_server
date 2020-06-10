const { user } = require('../../db/models');
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

        res.cookie('token', token).status(200).json({
          token: token,
          id: data.id,
          adminState: adminState,
        });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
