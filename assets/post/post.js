$(document).ready(() => {
  const postId = window.location.pathname.split('/').pop(); // URL에서 게시글 ID 추출
  if (postId) {
    getPost(postId);
  }
});

async function getPost(postId) {
  try {
    const res = await fetch(`/posts/details/${postId}`);
    const data = await res.json();
    const content = data.post.content.split('<img')[0];

    document.querySelector('#postTitle').value = data.post.title;
    document.querySelector('#postContent').value = content;
  } catch (err) {
    console.error(err);
  }
}

const postForm = document.querySelector('.postForm');

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData();

  const categoryList = document.querySelector('#postInterest').value;
  const title = document.querySelector('#postTitle').value;
  const content = document.querySelector('#postContent').value;
  const file = document.querySelector('#file').files[0];

  formData.append('categoryList', categoryList);
  formData.append('title', title);
  formData.append('content', content);
  formData.append('file', file);

  try {
    const res = await fetch('/posts', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.msg) {
      alert(data.msg);
    } else {
      alert(data.message);
      if (res.ok) {
        // 게시글 작성 완료 시 메인 페이지로 이동
        window.location.href = '/main';
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// 이미지 업로드 시 미리보기 기능
function readURL(input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      document.querySelector('#preview').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    document.querySelector('#preview').src = '';
  }
}

const postHandler = (() => {
  const cancel = document.querySelector('#cancelPostBtn');
  cancel.addEventListener('click', async () => {
    window.location.href = '/main';
  });
})();

//async function modfiyPost() {
//   const formData = new FormData();

//   const categoryList = document.querySelector('#postInterest').value;
//   const title = document.querySelector('#postTitle').value;
//   const content = document.querySelector('#postContent').value;
//   const file = document.querySelector('#file').files[0];

//   formData.append('categoryList', categoryList);
//   formData.append('title', title);
//   formData.append('content', content);
//   formData.append('file', file);

//   try {
//     const res = await fetch(`/posts/${postId}`, {
//       method: 'PUT',
//       body: formData,
//     });

//     const data = await res.json();
//     if (data.msg) {
//       alert(data.msg);
//     } else {
//       alert(data.message);
//       if (res.ok) {
//         // 게시글 작성 완료 시 메인 페이지로 이동
//         window.location.href = '/main';
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }

// async function savePost() {
//   const formData = new FormData();

//   const categoryList = document.querySelector('#postInterest').value;
//   const title = document.querySelector('#postTitle').value;
//   const content = document.querySelector('#postContent').value;
//   const file = document.querySelector('#file').files[0];

//   formData.append('categoryList', categoryList);
//   formData.append('title', title);
//   formData.append('content', content);
//   formData.append('file', file);

//   try {
//     const res = await fetch('/posts', {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await res.json();
//     if (data.msg) {
//       alert(data.msg);
//     } else {
//       alert(data.message);
//       if (res.ok) {
//         // 게시글 작성 완료 시 메인 페이지로 이동
//         window.location.href = '/main';
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }
