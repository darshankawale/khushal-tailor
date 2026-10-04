const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./src/config/config');
const { initData } = require('./src/services/json-store.service');
const { runCleanup } = require('./src/services/cleanup.service');
const { helmetConfig, generalLimiter } = require('./src/middleware/security');
const logger = require('./src/utils/logger');

// File-system data (./data local, or DATA_PATH on Render)
initData();

const app = express();
app.set('trust proxy', 1);

app.use(helmetConfig());
app.use(generalLimiter);
app.use(cors({ origin: false }));

app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));
app.use(cookieParser());

// No session — owner auth via headers only (low memory)

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: config.nodeEnv === 'production' ? '1h' : 0,
  etag: true
}));
app.use('/uploads', express.static(config.uploadsRoot, { maxAge: '1d' }));

app.use(require('./src/routes/public.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use(require('./src/routes/enquiry.routes'));
app.use(require('./src/routes/owner.routes'));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (req.path.startsWith('/owner/') && req.path.endsWith('.html')) {
    return res.sendFile(path.join(__dirname, 'public', req.path));
  }
  if (req.path === '/owner' || /^\/owner\/[^/]+$/.test(req.path)) {
    return res.sendFile(path.join(__dirname, 'public', 'owner', 'login.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large (max 3MB on free plan)' });
  }
  if (err.message && err.message.includes('Only JPEG')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Cleanup once per day
setInterval(() => {
  try { runCleanup(); } catch (e) { logger.error('Cleanup failed', { error: e.message }); }
}, 24 * 60 * 60 * 1000);
setTimeout(() => { try { runCleanup(); } catch (e) {} }, 8000);

const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Tailor platform on :${PORT} (512MB-friendly, file storage)`, {
    env: config.nodeEnv,
    dataRoot: config.dataRoot
  });
});
