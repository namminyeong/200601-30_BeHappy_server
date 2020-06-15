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
    specialty.belongsToMany(models.user, {
      through: 'userAndSpecialty',
      foreignKey: 'specialtyId',
    });
    specialty.belongsToMany(models.center, {
      through: 'centerAndSpecialty',
      foreignKey: 'specialtyId',
    });
    specialty.belongsToMany(models.review, {
      through: 'reviewAndSpecialty',
      foreignKey: 'specialtyId',
    });
  };

  return specialty;
};
