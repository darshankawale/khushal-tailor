require('dotenv').config();
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..', '..');
const DATA_ROOT = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.join(ROOT, 'data');

const UPLOADS_ROOT = process.env.DATA_PATH
  ? path.join(path.resolve(process.env.DATA_PATH), 'uploads')
  : path.join(ROOT, 'uploads');

// Ensure directories exist
[DATA_ROOT, path.join(DATA_ROOT, 'enquiries'), UPLOADS_ROOT,
 path.join(UPLOADS_ROOT, 'logo'), path.join(UPLOADS_ROOT, 'owner'),
 path.join(UPLOADS_ROOT, 'shop'), path.join(UPLOADS_ROOT, 'gallery'),
 path.join(UPLOADS_ROOT, 'services')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  ownerUsername: process.env.OWNER_USERNAME || 'owner',
  ownerPassword: process.env.OWNER_PASSWORD || 'ChangeMe123!',
  dataRoot: DATA_ROOT,
  uploadsRoot: UPLOADS_ROOT,
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '3', 10),
  enquiryRetentionDays: 7,
  paths: {
    shop: path.join(DATA_ROOT, 'shop.json'),
    services: path.join(DATA_ROOT, 'services.json'),
    settings: path.join(DATA_ROOT, 'settings.json'),
    gallery: path.join(DATA_ROOT, 'gallery.json'),
    timings: path.join(DATA_ROOT, 'timings.json'),
    holiday: path.join(DATA_ROOT, 'holiday.json'),
    enquiries: path.join(DATA_ROOT, 'enquiries'),
    ownerHash: path.join(DATA_ROOT, 'owner.hash') // unused with SQLite
  }
};
