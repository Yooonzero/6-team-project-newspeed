const express = require('express');
const { Users, Comments } = require('../models');
const router = express.Router();
const errors = require('../assets/errors.js');
const { verifyAccessToken } = require('../middleware/auth.middleware');

//댓글 불러오기
router.get('/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId;

  const comments = await Comments.findAll({
    where: { postId: postId },
    include: [
      {
        model: Users,
        attributes: ['nickname'],
      },
    ],
  });
  const data = comments.map((comments) => {
    return {
      commentId: comments.commentId,
      content: comments.content,
      UserId: comments.UserId,
      nickname: comments.User.nickname,
    };
  });
  res.json(data);
});

//댓글 작성
router.post('/posts/:postId/comments', verifyAccessToken, async (req, res) => {
  const PostId = req.params.postId;
  const UserId = res.locals.user.userId;
  const { content } = req.body;
  console.log(content);
  try {
    await Comments.create({ content, PostId, UserId });
    res.status(200).json({ message: '댓글 작성 완료' });
  } catch {
    return res.status(errors.makecomment.status).send({ msg: errors.makecomment.msg });
  }
});

//댓글 수정
router.put(
  '/posts/:postId/comments/:commentId',
  verifyAccessToken,

  async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const UserId = res.locals.user.userId;

    const comment = await Comments.findOne({ where: { commentId } });
    if (comment.UserId !== UserId) {
      return res.status(errors.theotherone.status).send({ msg: errors.theotherone.msg });
    } else {
      await Comments.update({ content }, { where: { commentId } }); // 수정할 데이터
    }
    res.status(201).json({ message: '댓글 수정 완료' });
  }
);

//댓글 삭제
router.delete('/posts/:postId/comments/:commentId', verifyAccessToken, async (req, res) => {
  const { commentId } = req.params;
  const { userId } = res.locals.user;

  const comment = await Comments.findOne({ where: { commentId: commentId } });
  if (comment.UserId !== userId) {
    return res.status(errors.theotherone.status).send({ msg: errors.theotherone.msg });
  } else {
    await Comments.destroy({ where: { commentId: commentId } }); //수정할 부분
  }
  res.status(201).json({ message: '댓글 삭제 완료' });
});

module.exports = router;
