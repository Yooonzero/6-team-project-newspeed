const { Users } = require('../models');
const errors = require('../assets/errors');
const authMiddleware = require('../middleware/auth.middleware');
const { verifyAccessToken } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

//* 회원가입
// 회원가입 페이지 띄우기
router.get('/signup', async (req, res) => {
  res.render('signup');
});

// 회원가입 처리
router.post('/signup', async (req, res) => {
  const { nickname, email, password, confirm, interest } = req.body;

  try {
    const user = await Users.findOne({
      where: {
        [Op.or]: [{ nickname }, { email }],
      },
    });

    if (user) {
      // 닉네임 고유값에 대한 검증을 합니다.
      if (user.nickname === nickname)
        return res.status(errors.existUser.status).send({ msg: errors.existUser.msg });

      // 이메일 고유값에 대한 검증을 합니다.
      if (user.email === email)
        return res.status(errors.existEmail.status).send({ msg: errors.existEmail.msg });
    }

    // 이메일 양식 검증
    let re = new RegExp(/^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/);
    if (!re.test(email))
      return res.status(errors.validEmail.status).send({ msg: errors.validEmail.msg });

    // 닉네임에 영문 대소문자, 숫자만 허용합니다.
    re = new RegExp(/^[a-zA-Z0-9]+$/);
    if (!re.test(nickname))
      return res.status(errors.validNickname.status).send({ msg: errors.validNickname.msg });

    // 패스워드 양식 검증
    re = new RegExp(/^[a-zA-Z0-9!@#$%^&*()]+$/);
    if (!re.test(password))
      return res.status(errors.validPassword.status).send({ msg: errors.validPassword.msg });

    // 패스워드와 패스워드 확인이 일치하는지 검증
    if (password !== confirm)
      return res.status(errors.passwordDiff.status).send({ msg: errors.passwordDiff.msg });

    // 닉네임 패턴 비밀번호 적용 유무를 검증
    re = new RegExp(nickname, 'i');
    if (re.test(password))
      return res.status(errors.nameInPassword.status).send({ msg: errors.nameInPassword.msg });

    // 비밀번호 해시화
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 계정 생성
    const userCreateResult = await Users.create({
      nickname,
      email,
      password: hashedPassword,
      interest,
    });
    res.send({
      msg: '회원가입이 완료되었습니다.',
    });
  } catch (err) {
    // 데이터베이스 접근 관련 에러 발생 시 catch로 이동
    console.error(err.name, ':', err.message);
    return res.status(400).send({ msg: `${err.message}` });
  }
});

//* 로그인
// 로그인 페이지 띄우기
router.get('/login', async (req, res) => {
  res.render('login');
});

// 로그인 처리
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 데이터베이스에서 유저 정보 조회
    const user = await Users.findOne({ where: { email } });
    if (!user) return res.status(errors.notUser.status).send({ msg: errors.notUser.msg });

    // 암호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(errors.passwordWrong.status).send({ msg: errors.passwordWrong.msg });

    // 리프레시 토큰을 데이터베이스에 저장
    const refreshToken = authMiddleware.getRefreshToken(user.nickname, user.userId); // 수정 예정
    const accessToken = authMiddleware.getAccessToken(
      user.nickname,
      user.userId,
      user.interest,
      user.email,
      refreshToken
    );

    const update = { refreshToken };
    await Users.update(update, { where: { userId: user.userId } });

    // 엑세스 토큰을 쿠키로 보냄
    res.cookie('accessCookie', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    });

    res.status(200).send({
      msg: '로그인에 성공하였습니다.',
      userId: user.userId,
    });
  } catch (err) {
    console.error(err.name, ':', err.message);
    return res.status(400).send({ msg: `${err.message}` });
  }
});

// 로그 아웃
router.get('/logout', verifyAccessToken, async (req, res) => {
  try {
    const user = res.locals.user;
    res.clearCookie('accessCookie');
    // res.send({ message: `${user.nickname}님이 로그아웃 되었습니다.` });
    res.redirect('/main')
  } catch {
    console.error(err.name, ':', err.message);
    return res.status(400).send({ msg: `${err.message}` });
  }
});

module.exports = router;
