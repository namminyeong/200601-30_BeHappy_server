const { user } = require('../../db/models');
const config = require('../../config/config.js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports = {
  post: (req, res) => {
    const { username, password } = req.body;
    var shasum = crypto.createHash('sha1');
    shasum.update(password);
    //let encryptedPassword = shasum.digest('hex');

    user
      .findOne({
        where: {
          username: username,
        },
      })
      .then(async (data) => {
        if (!data) {
          return res
            .status(403)
            .json({
              errorCode: 1,
              message: 'unvalid user',
            })
            .send('unvalid user');
        } else if (password !== data.password) {
          return res.status(403).json({
            errorCode: 2,
            message: 'wrong password',
          });
        }

        let token = jwt.sign(
          { id: data.id, username: username },
          config.secret,
          {
            expiresIn: '24h', // expires in 24 hours
          }
        );
        res.cookie('token', token).status(200).json({
          id: data.id,
        });
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },
};
