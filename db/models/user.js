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
          if (data.password) {
            var shasum = crypto.createHash(process.env.TOKEN_HASH);
            shasum.update(data.password);
            data.password = shasum.digest('hex');
          }
        },
      },
    }
  );
  user.associate = function (models) {
    user.belongsTo(models.centerAdmin, {
      foreignKey: 'centerAdminId',
    });
    user.belongsTo(models.city, {
      foreignKey: 'cityId',
    });
    user.belongsToMany(models.kindOfCenter, {
      through: 'userAndKindOfCenter',
      foreignKey: 'userId',
    });
    user.belongsToMany(models.specialty, {
      through: 'userAndSpecialty',
      foreignKey: 'userId',
    });
    user.belongsToMany(models.center, {
      through: 'bookmark',
      foreignKey: 'userId',
    });
  };
  return user;
};
