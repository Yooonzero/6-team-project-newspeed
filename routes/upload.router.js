const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');

// S3 이미지 업로드
router.post('/upload', uploadMiddleware.single('file'), async (req, res) => {
  const originalUrl = req.file.location;
  const url = originalUrl.relace(/\/original\//, '/thumb/');
  // 람다에서 리사이징 처리하고 새로 버킷에 압축 이미지를 저장하니, 압축된 이미지 버킷경로로 이미지url을 변경하여 클라이언트에 제공
  // 다만, 리사이징은 시간이 오래 걸리기 때문에 이미지가 일정 기간 동안 표시되지 않을 수 있으므로, 리사이징된 이미지를 로딩하는데 실패시 원본 이미지를 띄우기 위해 originalUrl도 같이 전송
  res.json({ url, originalUrl });
});
module.exports = router;
