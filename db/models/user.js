'use strict';
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
    { timestamps: false }
  );

  return user;
};
