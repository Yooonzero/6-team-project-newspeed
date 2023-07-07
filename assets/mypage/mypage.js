// 창이 로딩되면 이벤트 발생.
document.addEventListener('DOMContentLoaded', () => {
  userData();
});

// 유저 정보 조회태그
const userTag = document.querySelector('.user-tag');

// 유저의 게시글 조회태그
const userPostTag = document.querySelector('#userPostTag');

// 유저의 댓글 조회태그
const userCommentTag = document.querySelector('#userCommentTag');

// fetch로 정보 받아와서 json()화 시키기.
const userData = async () => {
  const res = await fetch(`/mypage/userinfo`);
  const userInfoData = await res.json();

  // 유저정보, 유저의 게시글 정보, 유저의 댓글 정보 뽑아오기
  const { user, posts, comments } = userInfoData;

  // 유저 정보 뿌리기
  userTag.innerHTML = `
                        <li>👫Nickname : ${user.nickname}</li>
                        <li>💌Email : ${user.email}</li>
                        <li>💓Interest : ${user.interest}</li>
                      `;

  // 게시글 정보 뿌리기
  posts.forEach((myPostInfo) => {
    console.log(myPostInfo);
    userPostTag.innerHTML += `
                            <div class="post-card">
                            <span id="post-title">제목: ${myPostInfo.title}</span>
                            <span id="post-content">내용: ${myPostInfo.content}</span>
                            <span id="post-date">생성일: ${myPostInfo.date}</span>
                          </div>
                            `;
  });

  // 댓글 정보 뿌리기
  comments.forEach((myCommentInfo) => {
    userCommentTag.innerHTML += `
                                <div class="comment-card">
                                <span id="comment-content">내용: ${myCommentInfo.content}</span>
                                <span id="comment-date">생성일: ${myCommentInfo.date}</span>
                              </div>
                                `;
  });
};

// ======================================수정 로직======================================

// 해당 폼데이터를 가져오고
const userDetail = document.querySelector('.user-detail-form');
// form데이터에 기본 내장되어 있는 기능을 기본으로 해준다.
userDetail.addEventListener('submit', (e) => {
  e.preventDefault();
});

// 닉네임 변경하기
const changeNicknameBtn = document.getElementById('changeNicknameBtn');
const changeNickname = async () => {
  // 새로운 닉네임을 받고,
  const newNickname = prompt('새로운 닉네임을 입력하세요.');
  // true 값이라면,
  if (newNickname) {
    try {
      // 해당 URI로 PUT요청을 보냄.
      const res = await fetch('/mypage/nickname', {
        method: 'PUT',
        // 바디에 있는 값을 JSON형태로 전송하겠다.
        headers: {
          'Content-Type': 'application/json',
        },
        // 바디에 값을 제이슨 형식으로 전달한다.
        body: JSON.stringify({ nickname: newNickname }),
        // 전달해서 로직을 수행하고,
      });
      // 제이슨 형태로 결과값을 받는다.
      await res.json().then((result) => {
        const errorMessage = result.errorMessage;
        if (errorMessage) {
          alert(result.errorMessage);
        } else {
          alert(result.message);
          window.location.reload();
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
};
// 버튼 클릭시 이벤트 실행
changeNicknameBtn.addEventListener('click', changeNickname);

// 관심사 변경하기
const changeInterestBtn = document.getElementById('changeInterestBtn');
const changeInterest = async () => {
  // prompt에 관심사를 받고,
  const newInterest = prompt(
    `    다음 관심사 중에서 하나를 선택해주세요.
    ['Music', 'Restaurant', 'Exercise', 'Movie', 'Travel']`
  );
  // 입력받은 값을 대문자로 변환하고,
  const upperCaseInput = newInterest.toUpperCase();
  // 입력받은 값이 true 값이라면,
  if (newInterest) {
    try {
      // 해당 URI로 PUT요청을 보냄.
      const res = await fetch('/mypage/interest', {
        method: 'PUT',
        // 바디에 있는 값을 JSON형태로 전송하겠다.
        headers: {
          'Content-Type': 'application/json',
        },
        // 바디에 값을 제이슨 형식으로 전달한다.
        body: JSON.stringify({ interest: upperCaseInput }),
        // 전달해서 로직을 수행하고,
      });
      // 제이슨 형태로 결과값을 받는다.
      await res.json().then((result) => {
        const errorMessage = result.errorMessage;
        if (errorMessage) {
          alert(result.errorMessage);
        } else {
          alert(result.message);
          window.location.reload();
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
};
// 버튼 클릭시 이벤트 실행
changeInterestBtn.addEventListener('click', changeInterest);

// 비밀번호 변경하기
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePassword = async () => {
  // 새로운 패스워드를 받고,
  const newPassword = prompt(`영문 대소문자 및 숫자로 3글자 이상의 암호를 입력해주세요.`);

  // true 값이라면,
  if (newPassword) {
    try {
      // 새로운 패스워드 확인하기.
      const newPasswordConfirm = prompt(`새로운 비밀번호를 다시 한 번 입력해주세요.`);
      // 해당 URI로 PUT요청을 보냄.
      const res = await fetch('/mypage/password', {
        method: 'PUT',
        // 바디에 있는 값을 JSON형태로 전송하겠다.
        headers: {
          'Content-Type': 'application/json',
        },
        // 바디에 값을 제이슨 형식으로 전달한다.
        body: JSON.stringify({ newPassword, newPasswordConfirm }),
        // 전달해서 로직을 수행하고,
      });
      // 제이슨 형태로 결과값을 받는다.
      await res.json().then((result) => {
        const errorMessage = result.errorMessage;
        if (errorMessage) {
          alert(result.errorMessage);
        } else {
          alert(result.message);
          window.location.reload();
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
};
// 버튼 클릭시 이벤트 실행
changePasswordBtn.addEventListener('click', changePassword);

// 회원 탈퇴하기
const userFireBtn = document.getElementById('userFireBtn');
const userFire = async () => {
  // 현재 비밀번호를 받아서,
  const confirm = prompt(`회원탈퇴 진행을 위해 현재 비밀번호를 입력해주세요.`);
  // true 값이라면,
  if (confirm) {
    try {
      // 해당 URI로 DELETE요청을 보냄.
      const res = await fetch('/mypage/userfire', {
        method: 'DELETE',
        // 바디에 있는 값을 JSON형태로 전송하겠다.
        headers: {
          'Content-Type': 'application/json',
        },
        // 바디에 값을 제이슨 형식으로 전달한다.
        body: JSON.stringify({ deletePassword: confirm }),
        // 전달해서 로직을 수행하고,
      });
      // 제이슨 형태로 결과값을 받는다.
      await res.json().then((result) => {
        const errorMessage = result.errorMessage;
        if (errorMessage) {
          alert(result.errorMessage);
        } else {
          alert(result.message);
          window.location.href = '/login';
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
};
// 버튼 클릭시 이벤트 실행
userFireBtn.addEventListener('click', userFire);
