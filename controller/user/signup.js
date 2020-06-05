const { user } = require('../../db/models');
module.exports = {
  post: (req, res) => {
    const { username, password } = req.body;
    user
      .findOrCreate({
        where: {
          username: username,
        },
        defaults: {
          password: password,
        },
      })
      .spread((result, created) => {
        if (!created) {
          return res.status(409).json({
            errorCode: 3,
            message: 'email exists',
          });
        } else {
          res.status(200).send('complete signup!');
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
