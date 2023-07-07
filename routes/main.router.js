const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth.middleware');
const fetch = require('node-fetch'); // html이 아닌 노드 안에서 fetch하려면 필요함

// 메인 페이지 이동
router.get('/main', isLoggedIn, async (req, res) => {
  // 로그인 상태를 파악합니다.
  const isLoggedIn = res.locals.isLoggedIn;

  try {
    const response = await fetch('http://127.0.0.1:3000/main/new-post');
    const data = await response.json();

    res.render('main', {
      isLoggedIn,
      data,
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
