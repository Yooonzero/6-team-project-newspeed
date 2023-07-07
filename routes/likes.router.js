const express = require('express');
const { Likes } = require('../models');
const { verifyAccessToken } = require('../middleware/auth.middleware');

const router = express.Router();

// 게시글 좋아요 API
router.post('/posts/:postId/like', verifyAccessToken, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    console.log(userId, postId);
    console.log('hi');
    const createLike = await Likes.findOne({ where: { UserId: userId, PostId: postId } });
    if (createLike) {
      await createLike.destroy();
      // 취소를 하면 postId의 count를 넣어 클릭 횟수가 감소됨
      const likeCount = await Likes.count({ where: { PostId: postId } });
      return res.status(200).json({ message: '좋아요 취소완료', likeCount });
    }

    await Likes.create({ UserId: userId, PostId: postId });
    // 좋아요를 하면 postId의 count를 넣어 클릭 횟수가 증가됨
    const likeCount = await Likes.count({ where: { PostId: postId } });
    res.status(200).json({ message: '좋아요 완료!', likeCount });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '좋아요 완료실패' });
  }
});
router.get('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const likes = await Likes.findAll({ where: { PostId: postId } });
    console.log(likes.length);
    return res.status(200).json({ message: '좋아요 조회 성공' });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
