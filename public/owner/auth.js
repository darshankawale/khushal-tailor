// Owner auth without sessions — credentials in localStorage, sent on every API call
const AUTH_USER_KEY = 'tailor_owner_user';
const AUTH_PASS_KEY = 'tailor_owner_pass';

function getOwnerCreds() {
  return {
    username: localStorage.getItem(AUTH_USER_KEY) || '',
    password: localStorage.getItem(AUTH_PASS_KEY) || ''
  };
}

function setOwnerCreds(username, password) {
  localStorage.setItem(AUTH_USER_KEY, username);
  localStorage.setItem(AUTH_PASS_KEY, password);
}

function clearOwnerCreds() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_PASS_KEY);
}

function isOwnerLoggedIn() {
  const c = getOwnerCreds();
  return !!(c.username && c.password);
}

function requireLoginPage() {
  if (!isOwnerLoggedIn()) {
    const path = location.pathname;
    if (!path.includes('login.html') && path !== '/owner' && !/^\/owner\/[^/]+$/.test(path)) {
      location.href = '/owner/login.html';
    }
    return false;
  }
  return true;
}

/** fetch wrapper — always sends owner headers */
async function ownerFetch(url, options = {}) {
  const c = getOwnerCreds();
  const headers = new Headers(options.headers || {});
  if (c.username) headers.set('X-Owner-Username', c.username);
  if (c.password) headers.set('X-Owner-Password', c.password);
  // Don't set Content-Type for FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const data = await res.clone().json().catch(() => ({}));
    if (data.code === 'AUTH_INVALID' || data.code === 'AUTH_REQUIRED') {
      clearOwnerCreds();
      alert(data.error || 'Please login again');
      location.href = '/owner/login.html';
    }
  }
  return res;
}

function ownerLogout() {
  clearOwnerCreds();
  location.href = '/owner/login.html';
}

window.ownerAuth = {
  getOwnerCreds, setOwnerCreds, clearOwnerCreds,
  isOwnerLoggedIn, requireLoginPage, ownerFetch, ownerLogout
};
