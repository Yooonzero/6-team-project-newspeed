class ErrorMessage {
  constructor(status, msg) {
    this.status = status;
    this.msg = msg;
  }
}

const errors = {
  noUser: new ErrorMessage(404, '해당 유저 정보가 존재하지 않습니다.'),
  noPost: new ErrorMessage(404, '해당 게시글이 존재하지 않습니다.'),
  noComment: new ErrorMessage(404, '해당 댓글이 존재하지 않습니다.'),

  notUser: new ErrorMessage(401, '회원이 아닙니다.'),
  passwordWrong: new ErrorMessage(401, '패스워드가 틀렸습니다.'),
  existUser: new ErrorMessage(412, '해당 아이디가 이미 존재합니다.'),
  existEmail: new ErrorMessage(412, '해당 이메일이 이미 존재합니다.'),
  validNickname: new ErrorMessage(412, '닉네임은 영문 대소문자, 숫자만 허용합니다.'),
  validEmail: new ErrorMessage(412, '이메일 양식이 올바르지 않습니다.'),
  validPassword: new ErrorMessage(412, '패스워드는 영문 대소문자, 숫자, 특수문자만 허용합니다.'),
  passwordDiff: new ErrorMessage(412, '패스워드와 패스워드 확인이 일치하지 않습니다.'),
  nameInPassword: new ErrorMessage(412, '닉네임 정보를 비밀번호에 적용할 수 없습니다.'),

  noCookie: new ErrorMessage(403, '로그인이 필요한 기능입니다.'), // 엑세스 토큰 검증을 위한 쿠키 없음
  refreshTokenDiff: new ErrorMessage(412, '리프레시 토큰이 일치하지 않습니다.'),
  expiredRefresh: new ErrorMessage(403, '로그인이 필요한 기능입니다.'), // 리프레시 토큰이 만료됨
  cantChangePost: new ErrorMessage(403, '해당 게시글의 수정 권한이 없습니다.'),
  cantChangeComment: new ErrorMessage(403, '해당 댓글의 수정 권한이 없습니다.'),
  makecomment: new ErrorMessage(400, '댓글 작성 실패'),
  theotherone: new ErrorMessage(401, '댓글 작성자만 가능한 동작입니다.'),
};

module.exports = errors;
