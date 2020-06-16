'use strict';
module.exports = (sequelize, DataTypes) => {
  const anonymousUser = sequelize.define(
    'anonymousUser',
    {
      anonymousName: DataTypes.STRING,
    },
    { timestamps: false }
  );
  anonymousUser.associate = function (models) {
    anonymousUser.belongsTo(models.user, {
      foreignKey: 'userId',
    });
    anonymousUser.belongsTo(models.center, {
      foreignKey: 'centerId',
    });
    anonymousUser.hasMany(models.review, {
      foreignKey: 'anonymousUserId',
    });
  };
  return anonymousUser;
};
