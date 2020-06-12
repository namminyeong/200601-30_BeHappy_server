'use strict';
module.exports = (sequelize, DataTypes) => {
  const specialty = sequelize.define(
    'specialty',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  specialty.associate = function (models) {
    specialty.hasMany(models.userAndSpecialty, {
      foreignKey: 'specialtyId',
    });
  };

  return specialty;
};
