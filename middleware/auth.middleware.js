const jwt = require('jsonwebtoken');
const { Users, Posts, Comments } = require('../models');
const errors = require('../assets/errors');

// 엑세스 토큰 생성기
const getAccessToken = (nickname, userId, interest, refreshToken) => {
  const accessToken = jwt.sign(
    { nickname, userId, interest, refreshToken },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: '1d',
    }
  );

  return accessToken;
};

// 리프레시 토큰 생성기
const getRefreshToken = (nickname, userId) => {
  const refreshToken = jwt.sign({ nickname, userId }, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: '1d',
  });

  return refreshToken;
};

// 엑세스 토큰 검증을 위한 미들웨어
function verifyAccessToken(req, res, next) {
  // 쿠키에서 access token을 획득합니다.
  const cookies = req.cookies;

  // 쿠키가 없는 경우
  if (!cookies?.accessCookie)
    return res.status(errors.noCookie.status).send({ message: errors.noCookie.msg });

  // access token 검증
  const accessToken = cookies.accessCookie;
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, async (err) => {
    req.user = jwt.decode(accessToken); // 페이로드 전달
    // access token이 만료된 경우
    if (err) {
      // 콘솔창에 만료됨을 알림
      console.error(err.name, ':', err.message);
      try {
        // DB에 저장된 리프레시 토큰 확인
        const user = await Users.findByPk(req.user.userId);
        const innerDatabaseRefreshToken = user.refreshToken;

        // 엑세스 토큰에 저장된 리프레시 토큰 확인
        const innerCookieRefreshToken = req.user.refreshToken;

        // 토큰 일치 여부 확인
        if (innerDatabaseRefreshToken !== innerCookieRefreshToken)
          return res
            .status(errors.refreshTokenDiff.status)
            .send({ message: errors.refreshTokenDiff.msg });

        // 리프레시 토큰 재발급 및 데이터베이스 저장
        const refreshToken = getRefreshToken(user.nickname, user.userId);
        const update = { refreshToken };
        await Users.update(update, { where: { userId: user.userId } });

        // 엑세스 토큰 재발급 및 쿠키로 보냄
        res.cookie(
          'accessCookie',
          getAccessToken(user.nickname, user.userId, user.interest, refreshToken),
          {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24시간
          }
        );
        console.log('엑세스 토큰 만료로 재발급 진행');
      } catch (err) {
        console.error(err.name, ':', err.message);
        return res.status(400).send({ message: `${err.message}` });
      }
    }
    res.locals.user = req.user;
    next();
  });
}

// 로그인 되어있는 상태인지 아닌지를 확인합니다.
async function isLoggedIn(req, res, next) {
  try {
    const cookies = req.cookies;

    // 쿠키가 없는 경우
    if (!cookies?.accessCookie) {
      res.locals.isLoggedIn = false;
      return next();
    }

    // access token 검증
    const accessToken = cookies.accessCookie;
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, async (err) => {
      if (err) {
        res.locals.isLoggedIn = false;
        return next();
      } else {
        res.locals.isLoggedIn = true;
      }
      next();
    });
  } catch (err) {
    console.error(err.name, ':', err.message);
    return res.status(400).send({ message: `${err.message}` });
  }
}

module.exports = {
  getAccessToken,
  getRefreshToken,
  verifyAccessToken,
  isLoggedIn,
};
