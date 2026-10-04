const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const logger = require('../utils/logger');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function readJson(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    logger.warn('readJson failed', { file, error: e.message });
  }
  return typeof fallback === 'function' ? fallback() : fallback;
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  return true;
}

function defaultShop() {
  return {
    shopName: process.env.SHOP_NAME || 'Raj Tailors',
    ownerName: process.env.OWNER_NAME || 'Raj Patil',
    phone: process.env.PHONE || '+91 98765 43210',
    whatsapp: process.env.WHATSAPP || '+919876543210',
    email: process.env.EMAIL || '',
    address: process.env.ADDRESS || 'Main Road, Pune, Maharashtra',
    pincode: process.env.PINCODE || '411001',
    googleMapsUrl: process.env.GOOGLE_MAPS_URL || '',
    googleReviewUrl: process.env.GOOGLE_REVIEW_URL || '',
    instagram: '', facebook: '', youtube: '', youtubeVideoUrl: '',
    logo: '', ownerPhoto: '', heroImage: '', aboutImage: '',
    heroHeading: 'Perfect Fit. Perfect Style.',
    heroSubtitle: 'Professional tailoring for every occasion — shirts, suits, blouses and more.',
    aboutTitle: 'About Our Shop',
    aboutText: 'Raj Tailors has been serving customers with precision fitting and quality finishing for over 15 years. Every garment is stitched with care according to your measurements and style.',
    experience: '15+ Years',
    speciality: 'Custom Tailoring',
    whyChooseUs: ['Perfect fitting', 'Quality finishing', 'Experienced tailor', 'Custom designs', 'On-time delivery', 'Affordable prices'],
    updatedAt: new Date().toISOString()
  };
}

function defaultSettings() {
  return {
    theme: process.env.THEME || 'premium',
    primaryColor: '#1a365d', secondaryColor: '#c9a227', buttonColor: '#c9a227',
    textColor: '#1a202c', bgColor: '#f8f9fa', cardBgColor: '#ffffff',
    languages: ['en', 'mr', 'hi'], defaultLanguage: 'en',
    festivalTheme: '', festivalStart: '', festivalEnd: '', showStatus: true,
    updatedAt: new Date().toISOString()
  };
}

function defaultTimings() {
  return {
    monday: { open: '09:00', close: '21:00', closed: false },
    tuesday: { open: '09:00', close: '21:00', closed: false },
    wednesday: { open: '09:00', close: '21:00', closed: false },
    thursday: { open: '09:00', close: '21:00', closed: false },
    friday: { open: '09:00', close: '21:00', closed: false },
    saturday: { open: '09:00', close: '21:00', closed: false },
    sunday: { open: '09:00', close: '21:00', closed: true }
  };
}

function svgSample(label, emoji, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><text x="200" y="175" text-anchor="middle" font-size="64">${emoji}</text><text x="200" y="250" text-anchor="middle" font-size="20" fill="#fff" font-family="sans-serif">${label}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function defaultServices() {
  return [
    { id: '1', name: 'Shirt Stitching', description: 'Custom fitted formal & casual shirts', price: 'From ₹400', icon: '👔', image: '', order: 1 },
    { id: '2', name: 'Blouse Stitching', description: 'Designer & traditional blouses', price: 'From ₹500', icon: '👗', image: '', order: 2 },
    { id: '3', name: 'Suit / Blazer', description: 'Premium suits and blazers', price: 'From ₹2500', icon: '🧥', image: '', order: 3 },
    { id: '4', name: 'Kurta / Pathani', description: 'Stylish kurtas for all occasions', price: 'From ₹600', icon: '🥻', image: '', order: 4 },
    { id: '5', name: 'Ladies Dress', description: 'Custom dresses and gowns', price: 'From ₹800', icon: '👚', image: '', order: 5 },
    { id: '6', name: 'Alteration', description: 'Quick and neat alterations', price: 'From ₹100', icon: '✂️', image: '', order: 6 }
  ];
}

function defaultGallery() {
  const now = new Date().toISOString();
  return [
    { id: 's1', url: svgSample("Men's Wear", '👔', '#1a365d', '#2c5282'), category: "Men's", caption: 'Formal shirts', order: 1, createdAt: now },
    { id: 's2', url: svgSample("Women's", '👗', '#702459', '#b83280'), category: "Women's", caption: 'Designer blouse', order: 2, createdAt: now },
    { id: 's3', url: svgSample('Wedding', '💒', '#744210', '#c9a227'), category: 'Wedding', caption: 'Wedding collection', order: 3, createdAt: now },
    { id: 's4', url: svgSample('Suit', '🧥', '#1a202c', '#4a5568'), category: 'Suit', caption: 'Premium suits', order: 4, createdAt: now },
    { id: 's5', url: svgSample('Kids', '🧒', '#276749', '#48bb78'), category: 'Kids', caption: 'Kids wear', order: 5, createdAt: now },
    { id: 's6', url: svgSample('Shop', '🏪', '#2b6cb0', '#63b3ed'), category: 'Shop', caption: 'Our shop', order: 6, createdAt: now }
  ];
}

const paths = {
  shop: () => path.join(config.dataRoot, 'shop.json'),
  settings: () => path.join(config.dataRoot, 'settings.json'),
  timings: () => path.join(config.dataRoot, 'timings.json'),
  holiday: () => path.join(config.dataRoot, 'holiday.json'),
  services: () => path.join(config.dataRoot, 'services.json'),
  gallery: () => path.join(config.dataRoot, 'gallery.json'),
  enquiries: () => path.join(config.dataRoot, 'enquiries'),
  ownerHash: () => path.join(config.dataRoot, 'owner.hash')
};

function initData() {
  ensureDir(config.dataRoot);
  ensureDir(paths.enquiries());
  if (!fs.existsSync(paths.shop())) writeJson(paths.shop(), defaultShop());
  if (!fs.existsSync(paths.settings())) writeJson(paths.settings(), defaultSettings());
  if (!fs.existsSync(paths.timings())) writeJson(paths.timings(), defaultTimings());
  if (!fs.existsSync(paths.holiday())) writeJson(paths.holiday(), { active: false, reason: '', closeUntil: '', reopenAt: '' });
  if (!fs.existsSync(paths.services())) writeJson(paths.services(), defaultServices());
  if (!fs.existsSync(paths.gallery())) writeJson(paths.gallery(), defaultGallery());
  if (!fs.existsSync(paths.ownerHash())) {
    fs.writeFileSync(paths.ownerHash(), bcrypt.hashSync(config.ownerPassword, 10), 'utf8');
  }
  logger.info('JSON store ready', { dataRoot: config.dataRoot });
}

function getShop() { return readJson(paths.shop(), defaultShop); }
function saveShop(data) { data.updatedAt = new Date().toISOString(); return writeJson(paths.shop(), data); }
function getSettings() { return readJson(paths.settings(), defaultSettings); }
function saveSettings(data) { data.updatedAt = new Date().toISOString(); return writeJson(paths.settings(), data); }
function getTimings() { return readJson(paths.timings(), defaultTimings); }
function saveTimings(data) { return writeJson(paths.timings(), data); }
function getHoliday() { return readJson(paths.holiday(), { active: false, reason: '', closeUntil: '', reopenAt: '' }); }
function saveHoliday(data) { return writeJson(paths.holiday(), data); }
function getServices() { return readJson(paths.services(), defaultServices); }
function saveServices(list) { return writeJson(paths.services(), list); }
function getGallery() { return readJson(paths.gallery(), defaultGallery); }
function saveGallery(list) { return writeJson(paths.gallery(), list); }

function listEnquiries() {
  ensureDir(paths.enquiries());
  const files = fs.readdirSync(paths.enquiries()).filter(f => f.endsWith('.json'));
  const list = [];
  for (const f of files) {
    try { list.push(JSON.parse(fs.readFileSync(path.join(paths.enquiries(), f), 'utf8'))); } catch {}
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function saveEnquiry(enquiry) {
  ensureDir(paths.enquiries());
  writeJson(path.join(paths.enquiries(), enquiry.id + '.json'), enquiry);
  return enquiry;
}
function deleteEnquiry(id) {
  const f = path.join(paths.enquiries(), id + '.json');
  if (fs.existsSync(f)) { fs.unlinkSync(f); return true; }
  return false;
}
function deleteOldEnquiries(days = 7) {
  const cutoff = Date.now() - days * 86400000;
  let n = 0;
  listEnquiries().forEach(e => {
    if (new Date(e.createdAt).getTime() < cutoff) { deleteEnquiry(e.id); n++; }
  });
  return n;
}

function verifyOwner(username, password) {
  if (username !== config.ownerUsername) return false;
  try {
    const hash = fs.readFileSync(paths.ownerHash(), 'utf8');
    return bcrypt.compareSync(password, hash);
  } catch { return false; }
}
function changeOwnerPassword(newPassword) {
  fs.writeFileSync(paths.ownerHash(), bcrypt.hashSync(newPassword, 10), 'utf8');
  return true;
}

function getShopStatus() {
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
