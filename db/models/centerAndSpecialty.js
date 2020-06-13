'use strict';
module.exports = (sequelize) => {
  const centerAndSpecialty = sequelize.define(
    'centerAndSpecialty',
    {},
    { timestamps: false }
  );

  return centerAndSpecialty;
};
