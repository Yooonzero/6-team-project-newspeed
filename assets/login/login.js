const queryString = window.location.search;
const queryParams = new URLSearchParams(queryString);
const message = queryParams.get('message');

if (message === 'redirect') {
  alert('로그인이 필요합니다.')
}

// 로그인 post fetch
const postLogin = async (result) => {
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });

    const data = await res.json();
    alert(data.msg);

    if (res.ok) {
      // 로그인 완료 시 메인 페이지로 이동
      window.location.href = '/main';
    }
  } catch (err) {
    console.error(err);
  }
};

// 로그인 버튼 이벤트리스너 등록(즉시 실행 함수)
// 입력된 로그인 정보를 json으로 정리해 백엔드로 보냅니다.
const loginHandler = (() => {
  const loginForm = document.querySelector('.login-form');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = new Object();
    for (let element of event.target) {
      if (element.name === '') continue;
      result[element.name] = element.value;
    }

    postLogin(result); // login POST 요청을 보냅니다.
  });
})();

// 회원가입 버튼 클릭 시 회원가입 페이지로 이동
const signupHandler = (() => {
  const signupButton = document.querySelector('.signup-button');
  signupButton.addEventListener('click', async () => {
    // await fetch('/signup');
    window.location.href = '/signup';
  });
})();
