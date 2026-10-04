const { deleteOldEnquiries } = require('./json-store.service');
const logger = require('../utils/logger');
const config = require('../config/config');

function runCleanup() {
  const deleted = deleteOldEnquiries(config.enquiryRetentionDays || 7);
  if (deleted) logger.info('Cleanup finished', { deleted });
  return deleted;
}

module.exports = { runCleanup };
