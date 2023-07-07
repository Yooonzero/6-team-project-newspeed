const express = require('express');
const { Op } = require('sequelize');
const { Users, Posts, Categories, Likes } = require('../models');
const { verifyAccessToken, isLoggedIn } = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const errors = require('../assets/errors');
const router = express.Router();
const fetch = require('node-fetch');

// 게시글 작성 페이지 띄우기 (비 로그인 시 로그인 페이지로 이동)
router.get('/posts', isLoggedIn, async (req, res) => {
  const isLoggedIn = res.locals.isLoggedIn;
  if (!isLoggedIn) {
    res.render('login');
  } else {
    res.render('createPost');
  }
});

// // 게시글 수정 페이지 띄우기
// router.get('/posts/:postId', async (req, res) => {
//   res.render('createPost');
// });

// 상세게시글 조회 페이지 띄우기
router.get('/posts/detail/:postId', verifyAccessToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    // 작성자 본인인지 검증
    const user = await Users.findByPk(userId, {
      include: [
        {
          model: Posts,
          attributes: ['postId'],
        },
      ],
    });
    // 유저가 작성한 포스트 배열 확인
    const posts = user.Posts;
    const postIds = posts.map((post) => post.postId);
    if (!postIds.includes(Number(postId))) {
      return res.status(412).send({ message: '해당 게시글의 작성자가 아닙니다.' });
    } else {
      res.render('postDetail', {
        postId,
      });
    }
  } catch (err) {
    console.error(err.name, ':', err.message);
    return res.status(400).send({ msg: `${err.message}` });
  }
});

// 게시글 작성
router.post('/posts', verifyAccessToken, uploadMiddleware.single('file'), async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const user = await Users.findByPk(userId);
    const filepath = req.file ? req.file.location : null;
    const { categoryList, title, content } = req.body;
    if (!title || !content) {
      res.status(412).json({
        message: '제목 또는 내용을 입력해주세요',
      });
      return;
    }

    const imageTag = filepath
      ? `<img src="${filepath}" width="300" height="300 alt="게시글 이미지" />`
      : '';
    const updatedContent = `${content} ${imageTag}`;
    // text사이에 img 삽입하는 방법을 찾아봐야함
    const post = await Posts.create({
      UserId: user.userId,
      Nickname: user.nickname,
      categoryList,
      title,
      content: updatedContent,
      img: filepath,
    });

    await Categories.create({
      PostId: post.postId,
      categoryList,
    });

    res.status(201).json({
      message: '게시글 생성완료',
    });
  } catch {
    return res.status(412).json({
      message: '데이터 형식이 올바르지 않아 생성에 실패했습니다.',
    });
  }
});

// 최신 게시글 조회 API -> 메인화면 출력되는 곳
// res는 추후 수정필요 (하나의 파일로 관리하여 오류메세지 통일)
router.get('/main/new-post', async (req, res) => {
  try {
    const postList = await Posts.findAll({
      attributes: ['postId', 'Nickname', 'categoryList', 'title', 'content'],
      include: [
        {
          model: Likes,
          attributes: ['likeId'], // []안에 아무 의미없음.
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!postList.length) {
      return res.status(404).json({
        message: '조회할 게시글이 없습니다.',
      });
    }

    res.status(200).json({
      postList,
    });
  } catch {
    return res.status(400).json({
      message: '게시글 조회에 실패하였습니다.',
    });
  }
});

// 관심사 게시글 조회
router.get('/posts/category/interest', verifyAccessToken, async (req, res) => {
  try {
    const userId = res.locals.user;

    if (!userId.interest) {
      return res.status(404).json({
        message: '설정된 관심사가 없습니다. 마이페이지에서 관심사를 등록해주세요.',
      });
    }
    const postList = await Posts.findAll({
      attributes: ['postId', 'Nickname', 'categoryList', 'title', 'content', 'img'],
      where: { categoryList: userId.interest },
      include: [
        {
          model: Likes,
          attributes: ['likeId'],
        },
      ],
    });

    return res.status(200).json({
      postList,
    });
  } catch {
    return res.status(400).json({
      message: '게시글 조회에 실패하였습니다.',
    });
  }
});

// 카테고리별 게시글 조회
router.get('/posts/category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const postList = await Posts.findAll({
      attributes: ['postId', 'Nickname', 'categoryList', 'title', 'content', 'img'],
      where: { categoryList: categoryId },
      include: [
        {
          model: Likes,
          attributes: ['likeId'],
        },
      ],
    });
    return res.status(200).json({
      postList,
    });
  } catch {
    return res.status(400).json({
      message: '게시글 조회에 실패하였습니다.',
    });
  }
});

// 게시글 상세 조회
router.get('/posts/details/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDetail = await Posts.findOne({
      attributes: [
        'postId',
        'userId',
        'categoryList',
        'nickname',
        'title',
        'content',
        'img',
        'createdAt',
        'updatedAt',
      ],
      where: { postId },
    });

    if (!postDetail) {
      return res.status(404).json({
        message: '해당 게시글을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      post: postDetail,
    });
  } catch {
    return res.status(400).json({
      message: '게시글 조회에 실패하였습니다.',
    });
  }
});

// 게시글 검색 기능
router.get('/lookup', async (req, res) => {
  try {
    // const { title, content, nickname } = req.query;
    const searchKeyword = req.query.keyword;
    if (searchKeyword.trim() === '') {
      return res.status(400).json({
        message: '검색어를 입력해주세요.',
      });
    }

    const postList = await Posts.findAll({
      attributes: ['postId', 'Nickname', 'categoryList', 'title', 'content', 'img'],
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchKeyword}%` } },
          { content: { [Op.like]: `%${searchKeyword}%` } },
          { nickname: { [Op.like]: `%${searchKeyword}%` } },
        ],
      },
      include: [
        {
          model: Likes,
          attributes: ['likeId'],
        },
      ],
    });

    return res.status(200).json({
      postList,
    });
  } catch {
    return res.status(400).json({
      message: '게시글 검색에 실패하였습니다.',
    });
  }
});

// 게시글 수정
router.put('/posts/:postId', async (req, res) => {
  try {
    const { postId, categoryList, title, content } = req.body;
    console.log(postId, categoryList);

    const modifyPost = await Posts.findOne({ where: { postId } });
    if (!modifyPost) {
      return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
    } else if (!categoryList || !title || !content) {
      return res.status(400).json({ message: '카테고리, 제목, 내용을 입력해주세요.' });
    } else {
      await Posts.update({ categoryList, title, content }, { where: { [Op.and]: [{ postId }] } });
      return res.status(201).json({
        message: '게시글 수정 완료',
      });
    }
  } catch {
    return res.status(400).json({
      message: '게시글 수정에 실패하였습니다.',
    });
  }
});

// 게시글 삭제
// 수정과 마찬가지로 작성자에게만 보이는 버튼이라면 아래 주석 삭제
router.delete('/posts/:postId', verifyAccessToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const deletePost = await Posts.findOne({ where: { postId } });

    if (!deletePost) {
      return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
    } else {
      await Posts.destroy({
        where: {
          [Op.and]: [{ postId }, { UserId: userId }],
        },
      });
      return res.status(201).json({
        message: '게시글 삭제 완료',
      });
    }
  } catch {
    return res.status(400).json({
      message: '게시글 삭제에 실패하였습니다.',
    });
  }
});

module.exports = router;
