require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');

const usersRouter = require('./routes/users.router');
const postsRouter = require('./routes/posts.router');
const uploadRouter = require('./routes/upload.router');
const mypageRouter = require('./routes/mypage.router');
const commentsRouter = require('./routes/comments.router');
const likeRouter = require('./routes/likes.router');
const mainRouter = require('./routes/main.router');

const HOST = '127.0.0.1';
const PORT = 3000;
const app = express();

// ejs 세팅
app.use(express.static(path.join(__dirname, 'assets')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.set('assets', path.join(__dirname, 'assets')); 없어도 되는 것 같아 주석처리함(추후 삭제)

// 서버 세팅
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // npm i cookie-parser

app.use('/', [
  usersRouter,
  postsRouter,
  mypageRouter,
  uploadRouter,
  commentsRouter,
  likeRouter,
  mainRouter,
]);

app.listen(PORT, HOST, () => {
  console.log('Server is listening...', PORT);
});
