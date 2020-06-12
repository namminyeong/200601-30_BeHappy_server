'use strict';
module.exports = (sequelize) => {
  const userAndKindOfCenter = sequelize.define(
    'userAndKindOfCenter',
    {},
    { timestamps: false }
  );

  return userAndKindOfCenter;
};
