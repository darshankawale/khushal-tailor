const express = require('express');
const router = express.Router();
const {
  getShop, saveShop, getSettings, saveSettings,
  getTimings, saveTimings, getHoliday, saveHoliday,
  getServices, saveServices, getGallery, saveGallery
} = require('../services/shop.service');
const { requireOwner } = require('../middleware/auth');
const { uploadLogo, uploadOwner, uploadShop, uploadGallery, uploadService, handleUpload } = require('../middleware/upload');
const { sanitizeString, isValidPhone, isValidEmail, isValidUrl } = require('../utils/validation');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

router.use(requireOwner);

// ---- Shop / About ----
router.get('/api/owner/shop', (req, res) => {
  res.json(getShop());
});

router.put('/api/owner/shop', (req, res) => {
  const current = getShop();
  const body = req.body || {};
  const take = (key, max, fallback) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      return sanitizeString(body[key], max);
    }
    return fallback !== undefined ? fallback : (current[key] || '');
  };
  const updated = {
    ...current,
    shopName: take('shopName', 100, current.shopName),
    ownerName: take('ownerName', 100, current.ownerName),
    phone: take('phone', 30, current.phone),
    whatsapp: take('whatsapp', 30, current.whatsapp),
    email: take('email', 100, current.email),
    address: take('address', 300, current.address),
    pincode: take('pincode', 20, current.pincode),
    googleMapsUrl: take('googleMapsUrl', 500, current.googleMapsUrl),
    googleReviewUrl: take('googleReviewUrl', 500, current.googleReviewUrl),
    instagram: take('instagram', 200, current.instagram),
    facebook: take('facebook', 200, current.facebook),
    youtube: take('youtube', 200, current.youtube),
    youtubeVideoUrl: take('youtubeVideoUrl', 500, current.youtubeVideoUrl || ''),
    heroHeading: take('heroHeading', 150, current.heroHeading),
    heroSubtitle: take('heroSubtitle', 300, current.heroSubtitle),
    aboutTitle: take('aboutTitle', 100, current.aboutTitle),
    aboutText: take('aboutText', 2000, current.aboutText),
    experience: take('experience', 50, current.experience),
    speciality: take('speciality', 100, current.speciality),
    whyChooseUs: Array.isArray(body.whyChooseUs)
      ? body.whyChooseUs.map(s => sanitizeString(s, 100)).filter(Boolean)
      : (current.whyChooseUs || [])
  };
  saveShop(updated);
  res.json({ success: true, shop: updated });
});

// Upload logo
router.post('/api/owner/upload/logo', handleUpload(uploadLogo.single('file')), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Choose a JPG or PNG image.' });
    const shop = getShop();
    shop.logo = `/uploads/logo/${req.file.filename}`;
    saveShop(shop);
    res.json({ success: true, url: shop.logo });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// Upload owner photo
router.post('/api/owner/upload/owner', handleUpload(uploadOwner.single('file')), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Choose a JPG or PNG image.' });
    const shop = getShop();
    shop.ownerPhoto = `/uploads/owner/${req.file.filename}`;
    saveShop(shop);
    res.json({ success: true, url: shop.ownerPhoto });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// Upload hero / shop image
router.post('/api/owner/upload/hero', handleUpload(uploadShop.single('file')), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Choose a JPG or PNG image.' });
    const shop = getShop();
    shop.heroImage = `/uploads/shop/${req.file.filename}`;
    saveShop(shop);
    res.json({ success: true, url: shop.heroImage });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// Upload about section image
router.post('/api/owner/upload/about', handleUpload(uploadShop.single('file')), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Choose a JPG or PNG image.' });
    const shop = getShop();
    shop.aboutImage = `/uploads/shop/${req.file.filename}`;
    saveShop(shop);
    res.json({ success: true, url: shop.aboutImage });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// ---- Settings / Themes / Languages ----
router.get('/api/owner/settings', (req, res) => {
  res.json(getSettings());
});

router.put('/api/owner/settings', (req, res) => {
  const current = getSettings();
  const body = req.body;
  const updated = {
    ...current,
    theme: ['normal', 'dark', 'premium', 'custom'].includes(body.theme) ? body.theme : current.theme,
    primaryColor: sanitizeString(body.primaryColor || current.primaryColor, 20),
    secondaryColor: sanitizeString(body.secondaryColor || current.secondaryColor, 20),
    buttonColor: sanitizeString(body.buttonColor || current.buttonColor, 20),
    textColor: sanitizeString(body.textColor || current.textColor || '#1a202c', 20),
    bgColor: sanitizeString(body.bgColor || current.bgColor || '#f8f9fa', 20),
    cardBgColor: sanitizeString(body.cardBgColor || current.cardBgColor || '#ffffff', 20),
    languages: Array.isArray(body.languages) ? body.languages : current.languages,
    defaultLanguage: sanitizeString(body.defaultLanguage || current.defaultLanguage, 5),
    festivalTheme: sanitizeString(body.festivalTheme || '', 50),
    festivalStart: sanitizeString(body.festivalStart || '', 30),
    festivalEnd: sanitizeString(body.festivalEnd || '', 30),
    showStatus: body.showStatus !== undefined ? !!body.showStatus : current.showStatus
  };
  saveSettings(updated);
  res.json({ success: true, settings: updated });
});

// ---- Timings ----
router.get('/api/owner/timings', (req, res) => {
  res.json(getTimings());
});

router.put('/api/owner/timings', (req, res) => {
  const body = req.body;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const updated = {};
  days.forEach(d => {
    if (body[d]) {
      updated[d] = {
        open: sanitizeString(body[d].open || '09:00', 5),
        close: sanitizeString(body[d].close || '21:00', 5),
        closed: !!body[d].closed
      };
    }
  });
  saveTimings(updated);
  res.json({ success: true, timings: updated });
});

// ---- Holiday ----
router.get('/api/owner/holiday', (req, res) => {
  res.json(getHoliday());
});

router.put('/api/owner/holiday', (req, res) => {
  const body = req.body;
  const updated = {
    active: !!body.active,
    reason: sanitizeString(body.reason || '', 200),
    closeUntil: sanitizeString(body.closeUntil || '', 30),
    reopenAt: sanitizeString(body.reopenAt || '', 50)
  };
  saveHoliday(updated);
  res.json({ success: true, holiday: updated });
});

// ---- Services ----
router.get('/api/owner/services', (req, res) => {
  res.json(getServices());
});

router.put('/api/owner/services', (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  const cleaned = list.map((s, i) => ({
    id: s.id || uuidv4(),
    name: sanitizeString(s.name, 100),
    description: sanitizeString(s.description, 300),
    price: sanitizeString(s.price, 50),
    icon: sanitizeString(s.icon, 10),
    image: sanitizeString(s.image || '', 200),
    order: s.order != null ? s.order : i + 1
  })).filter(s => s.name);
  saveServices(cleaned);
  res.json({ success: true, services: cleaned });
});

router.post('/api/owner/services/upload', handleUpload(uploadService.single('file')), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded. Choose a JPG or PNG image.' });
  res.json({ success: true, url: `/uploads/services/${req.file.filename}` });
});

// ---- Gallery ----
router.get('/api/owner/gallery', (req, res) => {
  res.json(getGallery());
});

router.post('/api/owner/gallery', handleUpload(uploadGallery.single('file')), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Choose a JPG or PNG image.' });
    const gallery = getGallery();
    const item = {
      id: uuidv4(),
      url: `/uploads/gallery/${req.file.filename}`,
      category: sanitizeString(req.body.category || 'Shop', 50),
      caption: sanitizeString(req.body.caption || '', 150),
      order: gallery.length + 1,
      createdAt: new Date().toISOString()
    };
    gallery.push(item);
    saveGallery(gallery);
    res.json({ success: true, item });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

router.put('/api/owner/gallery/:id', (req, res) => {
  const gallery = getGallery();
  const idx = gallery.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (req.body.category) gallery[idx].category = sanitizeString(req.body.category, 50);
  if (req.body.caption !== undefined) gallery[idx].caption = sanitizeString(req.body.caption, 150);
  if (req.body.order != null) gallery[idx].order = req.body.order;
  saveGallery(gallery);
  res.json({ success: true, item: gallery[idx] });
});

router.delete('/api/owner/gallery/:id', (req, res) => {
  let gallery = getGallery();
  const item = gallery.find(g => g.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  // Try delete file
  try {
    const filePath = path.join(config.uploadsRoot, 'gallery', path.basename(item.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
  gallery = gallery.filter(g => g.id !== req.params.id);
  saveGallery(gallery);
  res.json({ success: true });
});

module.exports = router;
