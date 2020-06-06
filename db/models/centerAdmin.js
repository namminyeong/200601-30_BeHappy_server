'use strict';
module.exports = (sequelize, DataTypes) => {
  const centerAdmin = sequelize.define(
    'centerAdmin',
    {
      businessNumber: DataTypes.STRING,
    },
    { timestamps: false }
  );
  centerAdmin.associate = function (models) {
    centerAdmin.hasOne(models.user, {
      foreignKey: 'centerAdminId',
    });
  };
  return centerAdmin;
};
