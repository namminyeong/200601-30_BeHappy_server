'use strict';
module.exports = (sequelize) => {
  const userAndSpecialty = sequelize.define(
    'userAndSpecialty',
    {},
    { timestamps: false }
  );
  userAndSpecialty.associate = function (models) {
    userAndSpecialty.belongsTo(models.user, {
      foreignKey: 'userId',
    });
    userAndSpecialty.belongsTo(models.specialty, {
      foreignKey: 'specialtyId',
    });
  };

  return userAndSpecialty;
};
