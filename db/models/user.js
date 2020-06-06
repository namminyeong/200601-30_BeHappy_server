'use strict';
const crypto = require('crypto');
require('dotenv').config();

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      username: DataTypes.STRING,
      nickname: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      isCenterAdminPending: DataTypes.BOOLEAN,
    },
    {
      timestamps: false,
      hooks: {
        afterValidate: (data) => {
          var shasum = crypto.createHash(process.env.TOKEN_HASH);
          shasum.update(data.password);
          data.password = shasum.digest('hex');
        },
      },
    }
  );

  return user;
};
