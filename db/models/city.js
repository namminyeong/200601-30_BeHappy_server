'use strict';
module.exports = (sequelize, DataTypes) => {
  const city = sequelize.define(
    'city',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  city.associate = function (models) {
    city.hasMany(models.user, {
      foreignKey: 'cityId',
    });
  };

  return city;
};
