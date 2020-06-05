'use strict';
module.exports = (sequelize, DataTypes) => {
  const center = sequelize.define(
    'center',
    {
      latitude: DataTypes.FLOAT(9, 6),
      longitude: DataTypes.FLOAT(9, 6),
      centerName: DataTypes.STRING,
      rateAvg: DataTypes.FLOAT(3, 2),
    },
    { timestamps: false }
  );
  center.associate = function (models) {
    center.hasOne(models.centerAdmin, {
      foreignKey: 'centerId',
    });
  };
  return center;
};
