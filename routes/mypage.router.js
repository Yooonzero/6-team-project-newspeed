const express = require('express');
const { Op, Sequelize } = require('sequelize');
const { verifyAccessToken } = require('../middleware/auth.middleware.js');
const { Users, Posts, Comments } = require('../models');
const bcrypt = require('bcrypt');
const router = express.Router();

// 마이 페이지 띄우기
router.get('/mypage', verifyAccessToken, async (req, res) => {
  const { userId } = res.locals.user;
  const userData = await Users.findOne({ where: { userId } });

  if (userData) {
    res.render('mypage.ejs', {
      nickname: userData.nickname,
    });
  } else {
    res.redirect('/login');
  }
});

// 유저 정보 조회 (유저정보 + 게시글 + 댓글)
router.get('/mypage/userinfo', verifyAccessToken, async (req, res) => {
  const userData = res.locals.user;

  try {
    // 유저 정보 조회
    const user = await Users.findOne({
      attributes: [
        'nickname',
        'email',
        'interest',
        [Sequelize.fn('left', Sequelize.col('createdAt'), 10), 'date'],
      ],
      where: { userId: userData.userId },
    });

    // 유저의 게시글 조회
    const post = await Posts.findAll({
      attributes: [
        'title',
        'content',
        [Sequelize.fn('left', Sequelize.col('createdAt'), 10), 'date'],
      ],
      where: { UserId: userData.userId },
    });

    // 유저의 댓글 조회
    const comment = await Comments.findAll({
      attributes: [
        'PostId',
        'content',
        [Sequelize.fn('left', Sequelize.col('createdAt'), 10), 'date'],
      ],
      where: { UserId: userData.userId },
    });

    // 유저의 정보, 게시글, 댓글 조회
    return res.status(200).json({
      user,
      posts: post,
      comments: comment,
    });
  } catch (err) {
    res.status(400).json({ errorMessage: '유저 정보 조회에 실패하였습니다.' });
  }
});

// 유저 정보 수정 (nickname,interest,password)

// 유저 닉네임 변경코드
router.put('/mypage/nickname', verifyAccessToken, async (req, res) => {
  const userData = res.locals.user;
  const { nickname } = req.body;

  // 닉네임 구성요소 확인
  try {
    const confirmedNickname = /^[a-zA-Z0-9]{3,}$/.test(nickname); // test() 메서드로 Boolean 값을 할당하고
    if (!confirmedNickname) {
      return res.status(412).json({
        errorMessage: '닉네임은 3글자 이상의 영문 대소문자, 숫자만 허용합니다.',
      });
    }

    // 닉네임 중복확인
    const existNickname = await Users.findAll({ where: { nickname } });
    if (existNickname.length !== 0) {
      return res.status(412).json({
        errorMessage: '이미 존재하는 닉네임 입니다.',
      });
    }

    await Users.update({ nickname }, { where: { [Op.and]: [{ userId: userData.userId }] } });
    return res.status(200).json({ message: '닉네임 수정이 정상적으로 완료되었습니다.' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ errorMessage: '닉네임 변경에 실패하였습니다.' });
  }
});

// 유저 관심사 변경코드
router.put('/mypage/interest', verifyAccessToken, async (req, res) => {
  const userData = res.locals.user;
  const { interest } = req.body;

  // 관심사 구성요소
  const interestArr = ['Music', 'Restaurant', 'Exercise', 'Movie', 'Travel'];
  // 구성요소 파악을 위해 대문자로 변환
  const upperCaseInterestArr = interestArr.map((i) => i.toUpperCase());

  try {
    // 관심사 형식 예외 처리
    if (!interest || interest.includes(' ') || interest === '' || interest === undefined) {
      return res.status(412).json({ errorMessage: '작성한 관심사의 형식이 올바르지 않습니다.' });
    }

    // 관심사 리스트 외의 요소들 예외 처리
    if (!upperCaseInterestArr.includes(interest)) {
      return res.status(412).json({ errorMessage: '작성한 관심사가 리스트에 존재하지 않습니다.' });
    }

    // 현재 관심사와 변경한 관심사가 일치할 경우
    // userData.interest에 있는 데이터가 DB에 저장되어 있는 interest 데이터와 달라서, find로 찾아옴.
    const user = await Users.findAll({
      where: { userId: userData.userId },
    });
    // 예외처리
    if (user[0].interest === interest) {
      return res.status(412).json({ errorMessage: '작성하신 관심사가 현재 관심사와 동일합니다.' });
    }

    // 관심사 변경
    await Users.update({ interest }, { where: { [Op.and]: [{ userId: userData.userId }] } });
    return res.status(200).json({ message: '관심사 수정이 정상적으로 완료되었습니다.' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ errorMessage: '관심사 변경에 실패하였습니다.' });
  }
});

// 유저 패스워드 변경코드
router.put('/mypage/password', verifyAccessToken, async (req, res) => {
  const userData = res.locals.user;
  const { newPassword, newPasswordConfirm } = req.body;

  // 바디에 입력받은 newPassword 해쉬화
  const saltRounds = 10;

  // 바디에 입력받은 newPassword를 단방향 암호화 시킨것
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Users 모델에 저장되어 있는 userId의 패스워드
  const { password } = await Users.findOne({ where: { userId: userData.userId } });

  // 해쉬화 시킨 패스워드와, 로그인된 유저의 패스워드가 일치한지 확인
  const matchPassword = await bcrypt.compare(newPassword, password);

  try {
    // 패스워드형식 예외처리
    if (
      !newPassword ||
      newPassword.includes(' ') ||
      newPassword === '' ||
      newPassword === undefined
    ) {
      return res.status(412).json({ errorMessage: '패스워드의 형식이 올바르지 않습니다.' });
    }

    // 패스워드 구성요소 확인
    const checkPassword = /^[a-zA-Z0-9]{3,}$/.test(newPassword);
    if (!checkPassword) {
      return res.status(412).json({
        errorMessage: '패스워드는 영대소문자와 숫자로만 구성될 수 있습니다.',
      });
    }

    // 기존의 패스워드와 다른지 확인
    if (matchPassword) {
      return res.status(401).json({ errorMessage: '새로운 비밀번호를 입력해주세요.' });
    }

    // 패스워드 confirm값과 일치한지 확인
    if (newPassword !== newPasswordConfirm) {
      return res.status(412).json({
        errorMessage: '패스워드 확인값이 일치하지 않습니다.',
      });
    }

    // 패스워드 변경
    await Users.update(
      { password: hashedPassword }, // 변경하고자 하는 컬럼 및 데이터
      {
        where: { [Op.and]: [{ userId: userData.userId }] }, // 일치 조건
      }
    ).catch((err) => {
      console.log(err);
      return res.status(401).json({ errorMessage: '패스워드가 변경되지 않았습니다.' }); // 확인
    });
    return res.status(201).json({ message: '패스워드를 성공적으로 수정하였습니다.' }); // 확인
  } catch (error) {
    return res.status(400).json({ errorMessage: '패스워드 변경에 실패하였습니다.' });
  }
});

// 회원탈퇴
router.delete('/mypage/userfire', verifyAccessToken, async (req, res) => {
  const userData = res.locals.user;
  const { deletePassword } = req.body;

  // 바디에 입력받은 deletePassword 해쉬화
  const saltRounds = 10;

  // 바디에 입력받은 deletePassword 단방향 암호화
  const hashedPassword = await bcrypt.hash(deletePassword, saltRounds);

  // Users 모델에 저장되어 있는 userId의 패스워드
  const { password } = await Users.findOne({ where: { userId: userData.userId } });

  // 해쉬화 시킨 패스워드와, 로그인된 유저의 패스워드가 일치한지 확인
  const matchPassword = await bcrypt.compare(deletePassword, password);

  try {
    // 입력받은 password가 회원의 패스워드와 일치한지 확인
    if (!matchPassword) {
      return res.status(412).json({ errorMessage: '패스워드 확인값이 일치하지 않습니다.' });
    }

    // 회원탈퇴
    if (matchPassword) {
      await Users.destroy({ where: { userId: userData.userId } });
      return res.status(200).json({ message: '회원탈퇴가 정상적으로 완료되었습니다.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ errorMessage: '회원탈퇴가 정상적으로 처리되지 않았습니다.' });
  }
});
module.exports = router;
