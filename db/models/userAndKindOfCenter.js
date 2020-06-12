'use strict';
module.exports = (sequelize) => {
  const userAndKindOfCenter = sequelize.define(
    'userAndKindOfCenter',
    {},
    { timestamps: false }
  );
  userAndKindOfCenter.associate = function (models) {
    userAndKindOfCenter.belongsTo(models.user, {
      foreignKey: 'userId',
    });
    userAndKindOfCenter.belongsTo(models.kindOfCenter, {
      foreignKey: 'kindsOfCenterId',
    });
  };

  return userAndKindOfCenter;
};
