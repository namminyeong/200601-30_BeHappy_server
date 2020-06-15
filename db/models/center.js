'use strict';
module.exports = (sequelize, DataTypes) => {
  const center = sequelize.define(
    'center',
    {
      latitude: DataTypes.FLOAT(9, 6),
      longitude: DataTypes.FLOAT(9, 6),
      centerName: DataTypes.STRING,
      addressName: DataTypes.STRING,
      roadAddressName: DataTypes.STRING,
      phone: DataTypes.STRING,
      rateAvg: {
        type: DataTypes.FLOAT(2, 1),
        defaultValue: 0,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  center.associate = function (models) {
    center.hasOne(models.centerAdmin, {
      foreignKey: 'centerId',
    });
    center.belongsToMany(models.specialty, {
      through: 'centerAndSpecialty',
      foreignKey: 'centerId',
    });
    center.belongsToMany(models.user, {
      through: 'bookmark',
      foreignKey: 'centerId',
    });
    center.hasMany(models.anonymousUser, {
      foreignKey: 'centerId',
    });
  };
  return center;
};
