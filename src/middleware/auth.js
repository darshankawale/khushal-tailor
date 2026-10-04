const { verifyOwner } = require('../services/json-store.service');

/**
 * No sessions / cookies.
 * Every owner API must send headers:
 *   X-Owner-Username
 *   X-Owner-Password
 * Verified against SQLite hash on each request.
 */
function requireOwner(req, res, next) {
  const username =
    req.headers['x-owner-username'] ||
    req.body?.username ||
    req.query?.username ||
    '';
  const password =
    req.headers['x-owner-password'] ||
    req.body?.password ||
    req.query?.password ||
    '';

  if (!username || !password) {
    return res.status(401).json({
      error: 'Login required. Open Owner Panel and enter username & password.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!verifyOwner(String(username), String(password))) {
    return res.status(401).json({
      error: 'Invalid username or password',
      code: 'AUTH_INVALID'
    });
  }

  req.ownerUsername = String(username);
  next();
}

module.exports = { requireOwner };
