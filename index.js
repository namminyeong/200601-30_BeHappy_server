const express = require('express');
const db = require('./db/models');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user');
const searchRouter = require('./routes/search');
const authRouter = require('./routes/auth');
const preferenceRouter = require('./routes/preference');
const bookmarkRouter = require('./routes/bookmark');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:19000',
      'http://localhost:19002',
      'http://localhost:19006',
    ],
    method: ['GET', 'POST'],
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('hello world!');
});
app.use('/user', userRouter);
app.use('/search', searchRouter);
app.use('/auth', authRouter);
app.use('/preference', preferenceRouter);
app.use('/bookmark', bookmarkRouter);
if (process.env.NODE_ENV !== 'production') {
  app.use('/sync', function (req, res) {
    db.sequelize.sync({ force: true });
    console.log('completed database sync with sequelize');
    res.send('completed database sync with sequelize');
  });
}
app.listen(port, () => {
  console.log('server 4000');
});
