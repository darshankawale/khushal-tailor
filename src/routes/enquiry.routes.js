const express = require('express');
const router = express.Router();
const { saveEnquiry, listEnquiries, deleteEnquiry, generatePdf, generateExcel } = require('../services/enquiry.service');
const { enquiryLimiter } = require('../middleware/security');
const { requireOwner } = require('../middleware/auth');
const { sanitizeString, isValidPhone } = require('../utils/validation');
const { uploadEnquiry, handleUpload } = require('../middleware/upload');
const path = require('path');

// Public: submit enquiry
router.post('/api/enquiry', enquiryLimiter, handleUpload(uploadEnquiry.single('referenceImage')), (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 100);
    const mobile = sanitizeString(req.body.mobile, 20);
    const service = sanitizeString(req.body.service, 100);
    const preferredDate = sanitizeString(req.body.preferredDate, 50);
    const message = sanitizeString(req.body.message, 1000);

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile are required' });
    }
    if (!isValidPhone(mobile)) {
      return res.status(400).json({ error: 'Please enter a valid mobile number' });
    }

    const data = {
      name,
      mobile,
      service,
      preferredDate,
      message,
      referenceImage: req.file ? `/uploads/gallery/${req.file.filename}` : ''
    };

    const enquiry = saveEnquiry(data);
    res.json({ success: true, message: 'Enquiry sent successfully. The shop will contact you shortly.', id: enquiry.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

// Owner: list enquiries
router.get('/api/owner/enquiries', requireOwner, (req, res) => {
  let list = listEnquiries();
  const { q, from, to, service } = req.query;
  if (q) {
    const lower = q.toLowerCase();
    list = list.filter(e =>
      (e.name && e.name.toLowerCase().includes(lower)) ||
      (e.mobile && e.mobile.includes(q)) ||
      (e.message && e.message.toLowerCase().includes(lower))
    );
  }
  if (service) {
    list = list.filter(e => e.service && e.service.toLowerCase().includes(service.toLowerCase()));
  }
  if (from) {
    const fromDate = new Date(from);
    list = list.filter(e => new Date(e.createdAt) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    list = list.filter(e => new Date(e.createdAt) <= toDate);
  }
  res.json(list);
});

// Owner: delete one
router.delete('/api/owner/enquiries/:id', requireOwner, (req, res) => {
  const ok = deleteEnquiry(req.params.id);
  if (ok) return res.json({ success: true });
  res.status(404).json({ error: 'Enquiry not found' });
});

// Owner: export PDF
router.get('/api/owner/enquiries/export/pdf', requireOwner, async (req, res) => {
  try {
    let list = listEnquiries();
    const { ids } = req.query;
    if (ids) {
      const idSet = new Set(ids.split(','));
      list = list.filter(e => idSet.has(e.id));
    }
    await generatePdf(list, res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Owner: export Excel
router.get('/api/owner/enquiries/export/excel', requireOwner, async (req, res) => {
  try {
    let list = listEnquiries();
    const { ids } = req.query;
    if (ids) {
      const idSet = new Set(ids.split(','));
      list = list.filter(e => idSet.has(e.id));
    }
    await generateExcel(list, res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

module.exports = router;
