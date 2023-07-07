// 회원가입 post fetch
const postSignup = async (signupInfo) => {
  try {
    const res = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupInfo),
    });

    const data = await res.json();
    alert(data.msg);

    if (res.ok) {
      // 로그인 페이지로 이동
      window.location.href = '/login';
    }
  } catch (err) {
    console.error(err);
  }
};

// 로그인 버튼 이벤트리스너 등록(즉시 실행 함수)
// 입력된 로그인 정보를 json으로 정리해 백엔드로 보냅니다.
const loginHandler = (() => {
  const loginForm = document.querySelector('.signup-form');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = new Object();
    for (let element of event.target) {
      if (element.name === '') continue;
      result[element.name] = element.value;
    }
    postSignup(result); // login POST 요청을 보냅니다.
  });
})();

// 취소 버튼 클릭 시 로그인 페이지로 이동
const signupHandler = (() => {
  const signupButton = document.querySelector('.signup-cancel');
  signupButton.addEventListener('click', async () => {
    // await fetch('/signup');
    window.location.href = '/login';
  });
})();
