'use strict';
module.exports = (sequelize) => {
  const reviewAndSpecialty = sequelize.define(
    'reviewAndSpecialty',
    {},
    { timestamps: false }
  );

  return reviewAndSpecialty;
};
