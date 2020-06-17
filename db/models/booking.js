'use strict';
module.exports = (sequelize, DataTypes) => {
  const booking = sequelize.define(
    'booking',
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  booking.associate = function (models) {
    booking.belongsTo(models.user, {
      foreignKey: 'userId',
    });
    booking.belongsTo(models.center, {
      foreignKey: 'centerId',
    });
  };
  return booking;
};
