'use strict';
module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    'tag',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  tag.associate = function (models) {
    tag.belongsTo(models.center, {
      foreignKey: 'centerId',
    });
  };

  return tag;
};
