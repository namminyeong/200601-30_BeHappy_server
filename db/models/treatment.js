'use strict';
module.exports = (sequelize, DataTypes) => {
  const treatment = sequelize.define(
    'treatment',
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  treatment.associate = function (models) {
    treatment.belongsTo(models.user, {
      foreignKey: 'userId',
    });
    treatment.belongsTo(models.center, {
      foreignKey: 'centerId',
    });
  };
  return treatment;
};
