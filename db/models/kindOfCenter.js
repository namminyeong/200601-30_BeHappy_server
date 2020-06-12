'use strict';
module.exports = (sequelize, DataTypes) => {
  const kindOfCenter = sequelize.define(
    'kindOfCenter',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  kindOfCenter.associate = function (models) {
    kindOfCenter.hasMany(models.userAndKindOfCenter, {
      foreignKey: 'kindsOfCenterId',
    });
  };

  return kindOfCenter;
};
