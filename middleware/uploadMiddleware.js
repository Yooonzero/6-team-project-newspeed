// 파일을 읽어오는 모듈
const multer = require('multer');
const multerS3 = require('multer-s3');
const sharp = require('sharp');
// S3 접근에 필요한 모듈
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

const s3 = new AWS.S3();
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];
const mimeType = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/gif'];

// S3 객체 업로드
const upLoadImg = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    shouldTransform: true,
    key: (req, file, callback) => {
      const uploadDirectory = req.query.directory ?? ''; // 업로드할 디렉토리 설정
      const extension = path.extname(file.originalname).toLowerCase();
      const fileMimetype = file.mimetype.toLowerCase();
      if (!allowedExtensions.includes(extension) || !mimeType.includes(fileMimetype)) {
        return callback(new Error('업로드가 불가능한 확장자입니다.'));
      }
      callback(null, `${uploadDirectory}/${Date.now()}_${file.originalname}`);
    },
    // transform: function (req, file, callback) {
    //   callback(null, sharp().resize(500, 500));
    // },
    acl: 'public-read-write',
    limits: { fileSize: 1024 * 1024 },
    contentType: multerS3.AUTO_CONTENT_TYPE, // 파일의 Content-Type 자동 설정
    metadata: (req, file, callback) => {
      callback(null, { fieldName: file.fieldname });
    },
  }),
});

module.exports = upLoadImg;
