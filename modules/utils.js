let jwt = require('jsonwebtoken');
const config = require('../config/config.js');

exports.checkToken = (req, res, next) => {
  let token = '';
  if (req.cookies.token) {
    token = req.cookies.token;
  } else {
    token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
  }

  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid',
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied',
    });
  }
};
