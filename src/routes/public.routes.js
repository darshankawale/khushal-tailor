const express = require('express');
const router = express.Router();
const {
  getShop, getSettings, getTimings, getHoliday,
  getServices, getGallery, getShopStatus
} = require('../services/shop.service');

function noCache(res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
}

router.get('/api/shop', (req, res) => {
  noCache(res);
  res.json({
    shop: getShop(),
    settings: getSettings(),
    timings: getTimings(),
    holiday: getHoliday(),
    services: getServices(),
    gallery: getGallery(),
    status: getShopStatus()
  });
});

router.get('/api/status', (req, res) => {
  noCache(res);
  res.json(getShopStatus());
});

module.exports = router;
