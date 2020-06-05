require('dotenv').config();
module.exports = {
  development: {
    username: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: 'behappy',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  },
  test: {
    username: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: 'behappy',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: 'hope',
    password: process.env.DATABASE_PASSWORD,
    database: 'behappy',
    host: 'behappy-database.cno4gcqrinhj.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mysql',
    logging: false,
  },
};
