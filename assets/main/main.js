// 게시글 가져오기 Fetch 후 결과 가져오기
const spreadPost = async (path) => {
  const cards = document.querySelector('.cards');
  try {
    const res = await fetch(path);
    const data = await res.json();

    if (res.ok) {
      location.reload()
      cards.innerHTML = '';
      data.postList.forEach((post) => {
        cards.innerHTML += `
                      <div class="post-card">
                        <a href="/posts/detail/${post.postId}">게시글 번호: <${post.postId}></a>
                        <hr />
                        <span>닉네임: ${post.Nickname}</span>
                        <hr />
                        <span>카테고리: ${post.categoryList}</span>
                        <hr />
                        <span>제목: ${post.title}</span>
                        <hr />
                        <span>내용: ${post.content}</span>
                        <hr />
                        <div class="like-container">
                        <button class="like-button" data-post-id="${post.postId}">👍</button>
                        <span class="like-count-${post.postId}">
                          ${post.Likes.length}
                        </span>
                        </div>
                      </div>
                      `;
      });
    } else {
      alert(data.message);
      // window.location.href = '/login';
    }
  } catch (error) {
    console.error(error);
  }
};

// 관심글 버튼 작동
const interestEvent = (() => {
  const interestButton = document.querySelector('.interest-posts-button');

  interestButton.addEventListener('click', () => {
    spreadPost('/posts/category/interest');
  });
})();

// 최신글 버튼 작동
const recentEvent = (() => {
  const recentButton = document.querySelector('.recent-posts-button');

  recentButton.addEventListener('click', () => {
    spreadPost('/main/new-post');
  });
})();

// 카테고리 버튼 작동
const categoryEvent = (() => {
  const categoryForm = document.querySelector('.category-form');

  categoryForm.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      // 클릭된 버튼의 value 가져오기
      const categoryId = event.target.value; // Music 또는 Movie를 가져옵니다.
      spreadPost(`/posts/category/${categoryId}`);
    }
  });
})();

// 키워드 검색
const searchEvent = (() => {
  const searchForm = document.querySelector('.search-form');

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchKeyword = event.target[0].value;
    spreadPost(`/lookup?keyword=${searchKeyword}`);
  });
})();

// 좋아요 버튼에 이벤트리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  // All을 통해 모든like-button을 likeButtons 변수에 저장
  const likeButtons = document.querySelectorAll('.like-button');

  // forEach를 통해 각각의 좋아요 버튼에 함수 시작
  likeButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const postId = button.dataset.postId;
      console.log(postId);
      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          const likeCount = document.querySelector(`.like-count-${postId}`);
          likeCount.innerText = result.likeCount;
        } else {
          alert('로그인 후 이용해주세요.');
        }
      } catch (error) {
        console.error(error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    });
  });
});
