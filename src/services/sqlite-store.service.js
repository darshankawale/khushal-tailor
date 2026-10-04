const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logger = require('../utils/logger');
const jsonDefaults = require('./json-store.service');

let db;

function initDb() {
  if (db) return db;
  fs.mkdirSync(config.dataRoot, { recursive: true });
  db = new Database(path.join(config.dataRoot, 'shop.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS services (id TEXT PRIMARY KEY, data TEXT NOT NULL, sort_order INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, data TEXT NOT NULL, sort_order INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS owner_auth (id INTEGER PRIMARY KEY CHECK (id = 1), password_hash TEXT NOT NULL);
  `);
  return db;
}

function getKv(key, fallback) {
  initDb();
  const row = db.prepare('SELECT data FROM kv WHERE key = ?').get(key);
  if (row) return JSON.parse(row.data);
  const val = typeof fallback === 'function' ? fallback() : fallback;
  db.prepare('INSERT OR REPLACE INTO kv (key, data) VALUES (?, ?)').run(key, JSON.stringify(val));
  return val;
}
function setKv(key, data) {
  initDb();
  data.updatedAt = new Date().toISOString();
  db.prepare('INSERT OR REPLACE INTO kv (key, data) VALUES (?, ?)').run(key, JSON.stringify(data));
  return true;
}

function initData() {
  initDb();
  getKv('shop', () => {
    // use same defaults as json by reading functions - inline minimal
    return {
      shopName: process.env.SHOP_NAME || 'Raj Tailors',
      ownerName: process.env.OWNER_NAME || 'Raj Patil',
      phone: process.env.PHONE || '+91 98765 43210',
      whatsapp: process.env.WHATSAPP || '+919876543210',
      email: '', address: process.env.ADDRESS || 'Main Road, Pune, Maharashtra', pincode: '411001',
      googleMapsUrl: '', googleReviewUrl: '', instagram: '', facebook: '', youtube: '', youtubeVideoUrl: '',
      logo: '', ownerPhoto: '', heroImage: '', aboutImage: '',
      heroHeading: 'Perfect Fit. Perfect Style.',
      heroSubtitle: 'Professional tailoring for every occasion — shirts, suits, blouses and more.',
      aboutTitle: 'About Our Shop',
      aboutText: 'Raj Tailors has been serving customers with precision fitting and quality finishing for over 15 years.',
      experience: '15+ Years', speciality: 'Custom Tailoring',
      whyChooseUs: ['Perfect fitting', 'Quality finishing', 'Experienced tailor', 'Custom designs', 'On-time delivery', 'Affordable prices'],
      updatedAt: new Date().toISOString()
    };
  });
  getKv('settings', () => ({
    theme: 'premium', primaryColor: '#1a365d', secondaryColor: '#c9a227', buttonColor: '#c9a227',
    textColor: '#1a202c', bgColor: '#f8f9fa', cardBgColor: '#ffffff',
    languages: ['en','mr','hi'], defaultLanguage: 'en', festivalTheme: '', festivalStart: '', festivalEnd: '', showStatus: true
  }));
  getKv('timings', () => {
    const d = { open: '09:00', close: '21:00', closed: false };
    return { monday: {...d}, tuesday: {...d}, wednesday: {...d}, thursday: {...d}, friday: {...d}, saturday: {...d}, sunday: { open: '09:00', close: '21:00', closed: true } };
  });
  getKv('holiday', () => ({ active: false, reason: '', closeUntil: '', reopenAt: '' }));

  if (db.prepare('SELECT COUNT(*) as c FROM services').get().c === 0) {
    const services = [
      { id: '1', name: 'Shirt Stitching', description: 'Custom fitted shirts', price: 'From ₹400', icon: '👔', image: '', order: 1 },
      { id: '2', name: 'Blouse Stitching', description: 'Designer blouses', price: 'From ₹500', icon: '👗', image: '', order: 2 },
      { id: '3', name: 'Suit / Blazer', description: 'Premium suits', price: 'From ₹2500', icon: '🧥', image: '', order: 3 },
      { id: '4', name: 'Kurta / Pathani', description: 'Stylish kurtas', price: 'From ₹600', icon: '🥻', image: '', order: 4 },
      { id: '5', name: 'Ladies Dress', description: 'Custom dresses', price: 'From ₹800', icon: '👚', image: '', order: 5 },
      { id: '6', name: 'Alteration', description: 'Quick alterations', price: 'From ₹100', icon: '✂️', image: '', order: 6 }
    ];
    const ins = db.prepare('INSERT INTO services (id, data, sort_order) VALUES (?, ?, ?)');
    services.forEach(s => ins.run(s.id, JSON.stringify(s), s.order));
  }
  if (db.prepare('SELECT COUNT(*) as c FROM gallery').get().c === 0) {
    // seed from json defaults if available
    try {
      const g = require('./json-store.service');
      // can't call defaultGallery - seed simple
    } catch {}
  }
  if (!db.prepare('SELECT id FROM owner_auth WHERE id = 1').get()) {
    db.prepare('INSERT INTO owner_auth (id, password_hash) VALUES (1, ?)').run(bcrypt.hashSync(config.ownerPassword, 10));
  }
  logger.info('SQLite store ready');
}

function getShop() { return getKv('shop', {}); }
function saveShop(d) { return setKv('shop', d); }
function getSettings() { return getKv('settings', {}); }
function saveSettings(d) { return setKv('settings', d); }
function getTimings() { return getKv('timings', {}); }
function saveTimings(d) { initDb(); db.prepare('INSERT OR REPLACE INTO kv (key, data) VALUES (?, ?)').run('timings', JSON.stringify(d)); return true; }
function getHoliday() { return getKv('holiday', { active: false }); }
function saveHoliday(d) { initDb(); db.prepare('INSERT OR REPLACE INTO kv (key, data) VALUES (?, ?)').run('holiday', JSON.stringify(d)); return true; }
function getServices() { initDb(); return db.prepare('SELECT data FROM services ORDER BY sort_order').all().map(r => JSON.parse(r.data)); }
function saveServices(list) {
  initDb();
  const tx = db.transaction(items => {
    db.prepare('DELETE FROM services').run();
    const ins = db.prepare('INSERT INTO services (id, data, sort_order) VALUES (?, ?, ?)');
    items.forEach((s, i) => { s.order = s.order != null ? s.order : i + 1; ins.run(s.id, JSON.stringify(s), s.order); });
  });
  tx(list); return true;
}
function getGallery() { initDb(); return db.prepare('SELECT data FROM gallery ORDER BY sort_order').all().map(r => JSON.parse(r.data)); }
function saveGallery(list) {
  initDb();
  const tx = db.transaction(items => {
    db.prepare('DELETE FROM gallery').run();
    const ins = db.prepare('INSERT INTO gallery (id, data, sort_order) VALUES (?, ?, ?)');
    items.forEach((g, i) => { g.order = g.order != null ? g.order : i + 1; ins.run(g.id, JSON.stringify(g), g.order); });
  });
  tx(list); return true;
}
function listEnquiries() { initDb(); return db.prepare('SELECT data FROM enquiries ORDER BY created_at DESC').all().map(r => JSON.parse(r.data)); }
function saveEnquiry(e) { initDb(); db.prepare('INSERT INTO enquiries (id, data, created_at) VALUES (?, ?, ?)').run(e.id, JSON.stringify(e), e.createdAt); return e; }
function deleteEnquiry(id) { initDb(); return db.prepare('DELETE FROM enquiries WHERE id = ?').run(id).changes > 0; }
function deleteOldEnquiries(days = 7) {
  initDb();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  return db.prepare('DELETE FROM enquiries WHERE created_at < ?').run(cutoff).changes;
}
function verifyOwner(u, p) {
  if (u !== config.ownerUsername) return false;
  initDb();
  const row = db.prepare('SELECT password_hash FROM owner_auth WHERE id = 1').get();
  return row && bcrypt.compareSync(p, row.password_hash);
}
function changeOwnerPassword(p) {
  initDb();
  db.prepare('UPDATE owner_auth SET password_hash = ? WHERE id = 1').run(bcrypt.hashSync(p, 10));
  return true;
}
function getShopStatus() {
  // reuse json-store logic via copy
  const holiday = getHoliday();
  const now = new Date();
  if (holiday.active && holiday.closeUntil && now < new Date(holiday.closeUntil)) {
    return { isOpen: false, status: 'holiday', message: holiday.reason || 'Temporarily closed', reopenAt: holiday.reopenAt || holiday.closeUntil };
  }
  const timings = getTimings();
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const t = timings[days[now.getDay()]];
  if (!t || t.closed) return { isOpen: false, status: 'closed', message: 'Closed today', reopenAt: null };
  const [oh, om] = t.open.split(':').map(Number);
  const [ch, cm] = t.close.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  if (cur >= oh * 60 + om && cur < ch * 60 + cm) return { isOpen: true, status: 'open', message: 'Open now', reopenAt: null };
  return { isOpen: false, status: 'closed', message: 'Closed now', reopenAt: null };
}

module.exports = {
  initData, getShop, saveShop, getSettings, saveSettings, getTimings, saveTimings,
  getHoliday, saveHoliday, getServices, saveServices, getGallery, saveGallery,
  listEnquiries, saveEnquiry, deleteEnquiry, deleteOldEnquiries,
  verifyOwner, changeOwnerPassword, getShopStatus
};
