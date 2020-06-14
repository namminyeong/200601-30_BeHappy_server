'use strict';
module.exports = (sequelize) => {
  const bookmark = sequelize.define('bookmark', {}, { timestamps: false });

  return bookmark;
};
