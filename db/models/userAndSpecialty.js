'use strict';
module.exports = (sequelize) => {
  const userAndSpecialty = sequelize.define(
    'userAndSpecialty',
    {},
    { timestamps: false }
  );

  return userAndSpecialty;
};
