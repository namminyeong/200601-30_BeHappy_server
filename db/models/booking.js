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
      bookingState: {
        type: DataTypes.ENUM('booked', 'used', 'notUsed', 'reviewed'),
        defaultValue: 'booked',
        allowNull: false,
      },
      usedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      usedTime: {
        type: DataTypes.TIME,
        allowNull: true,
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
