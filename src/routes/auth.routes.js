const express = require('express');
const router = express.Router();
const { verifyOwner, changeOwnerPassword } = require('../services/json-store.service');
const { loginLimiter } = require('../middleware/security');
const { requireOwner } = require('../middleware/auth');
const logger = require('../utils/logger');

// Check credentials (no session created)
router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (!verifyOwner(username, password)) {
    logger.warn('Failed login', { username });
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  logger.info('Owner credentials OK', { username });
  // Client stores credentials in localStorage — server has no session
  return res.json({
    success: true,
    username,
    redirect: '/owner/dashboard.html'
  });
});

router.post('/logout', (req, res) => {
  // Nothing to clear on server
  res.json({ success: true, redirect: '/owner/login.html' });
});

router.get('/check', (req, res) => {
  // Client-side only; server is always "logged out"
  res.json({ isOwner: false, mode: 'header-auth' });
});

router.post('/change-password', requireOwner, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  if (!verifyOwner(req.ownerUsername, currentPassword)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  changeOwnerPassword(newPassword);
  res.json({ success: true, message: 'Password updated. Please login again with new password.' });
});

module.exports = router;
