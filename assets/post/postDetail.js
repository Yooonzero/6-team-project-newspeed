const postId = window.location.pathname.split('/').pop(); // URL에서 게시글 ID 추출

const postDetail = async (postId) => {
  try {
    const res = await fetch(`/posts/details/${postId}`);
    const data = await res.json();

    if (res.ok) {
      const post = data.post;
      const content = post.content.split('<img')[0];
      document.querySelector('#postTitle').value = post.title;
      document.querySelector('#postInterest').value = post.categoryList;
      document.querySelector('#postContent').value = content;
    } else {
      console.error(data.msg);
    }
  } catch (err) {
    console.error(err);
  }
};
postDetail(postId);


// 게시글 수정에 관한 함수
const modifyPost = async (postId, title, categoryList, content) => {
  const modifyTargetInfo = { postId, title, categoryList, content };
  try {
    const res = await fetch(`/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modifyTargetInfo),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      // 수정 완료 시 메인 페이지로 이동
      window.location.href = '/main';
    }
  } catch (err) {
    console.error(err);
  }
};

// 수정 버튼 이벤트리스너 등록
const modifyHandler = (() => {
  const modifyBtn = document.querySelector('#modifyBtn');
  modifyBtn.addEventListener('click', () => {
    // 상세페이지에 이미 입력된 value들을 가져온다.
    const postId = modifyBtn.value;
    const title = document.querySelector('#postTitle').value;
    const categoryList = document.querySelector('#postInterest').value;
    const content = document.querySelector('#postContent').value;
    modifyPost(postId, title, categoryList, content);
  });
})();

// 게시글 삭제에 관한 함수
const deletePost = async (postId) => {
  try {
    const res = await fetch(`/posts/${postId}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      // 삭제 완료 시 메인 페이지로 이동
      window.location.href = '/main';
    }
  } catch (err) {
    console.error(err);
  }
};

// 삭제 버튼 이벤트리스너 등록
const deleteHandler = (() => {
  const deleteBtn = document.querySelector('#deleteBtn');
  deleteBtn.addEventListener('click', () => {
    const postId = modifyBtn.value;
    deletePost(postId);
  });
})();
