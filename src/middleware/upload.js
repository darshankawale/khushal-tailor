const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/pjpeg',
  'application/octet-stream' // some mobile browsers
];

function createUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(config.uploadsRoot, subfolder);
      try {
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname || '').toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        // guess from mimetype
        if (file.mimetype && file.mimetype.includes('png')) ext = '.png';
        else if (file.mimetype && file.mimetype.includes('webp')) ext = '.webp';
        else if (file.mimetype && file.mimetype.includes('gif')) ext = '.gif';
        else ext = '.jpg';
      }
      cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: (config.maxUploadMb || 5) * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const mimeOk = !file.mimetype || ALLOWED_MIME.includes(file.mimetype) || file.mimetype.startsWith('image/');
      const extOk = !ext || ALLOWED_EXT.includes(ext);
      if (mimeOk || extOk) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed. HEIC (iPhone) — please convert to JPG first.'));
      }
    }
  });
}

function handleUpload(uploader) {
  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: `File too large. Max ${config.maxUploadMb || 5} MB` });
        }
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      next();
    });
  };
}

module.exports = {
  uploadLogo: createUploader('logo'),
  uploadOwner: createUploader('owner'),
  uploadShop: createUploader('shop'),
  uploadGallery: createUploader('gallery'),
  uploadService: createUploader('services'),
  uploadEnquiry: createUploader('gallery'),
  handleUpload
};
