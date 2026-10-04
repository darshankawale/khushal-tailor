const { v4: uuidv4 } = require('uuid');
const {
  listEnquiries, saveEnquiry: dbSave, deleteEnquiry, deleteOldEnquiries, getShop
} = require('./json-store.service');
const logger = require('../utils/logger');
const config = require('../config/config');

function saveEnquiry(data) {
  const enquiry = {
    id: uuidv4(),
    name: data.name || '',
    mobile: data.mobile || '',
    service: data.service || '',
    preferredDate: data.preferredDate || '',
    message: data.message || '',
    referenceImage: data.referenceImage || '',
    createdAt: new Date().toISOString()
  };
  dbSave(enquiry);
  logger.info('Enquiry saved', { id: enquiry.id });
  return enquiry;
}

async function generatePdf(enquiries, res) {
  const PDFDocument = require('pdfkit'); // lazy load
  const shop = getShop();
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${Date.now()}.pdf"`);
  doc.pipe(res);
  doc.fontSize(18).text(shop.shopName || 'Shop Enquiries', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#555').text(`Report: ${new Date().toLocaleString('en-IN')} | Total: ${enquiries.length}`, { align: 'center' });
  doc.moveDown();
  doc.fillColor('#000');
  if (!enquiries.length) {
    doc.fontSize(12).text('No enquiries found.', { align: 'center' });
  } else {
    enquiries.slice(0, 200).forEach((e, i) => {
      if (i > 0) doc.moveDown(0.35);
      doc.fontSize(11).fillColor('#1a365d').text(`${i + 1}. ${e.name} — ${e.mobile}`);
      doc.fontSize(9).fillColor('#333');
      doc.text(`Service: ${e.service || '-'} | Preferred: ${e.preferredDate || '-'}`);
      doc.text(`Date: ${new Date(e.createdAt).toLocaleString('en-IN')}`);
      if (e.message) doc.text(`Message: ${(e.message || '').slice(0, 300)}`);
    });
  }
  doc.end();
}

async function generateExcel(enquiries, res) {
  const ExcelJS = require('exceljs'); // lazy load
  const shop = getShop();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = shop.shopName || 'Tailor';
  const sheet = workbook.addWorksheet('Enquiries');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Customer', key: 'name', width: 20 },
    { header: 'Mobile', key: 'mobile', width: 16 },
    { header: 'Service', key: 'service', width: 20 },
    { header: 'Preferred Date', key: 'preferredDate', width: 16 },
    { header: 'Message', key: 'message', width: 40 }
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A365D' } };
  enquiries.slice(0, 500).forEach(e => {
    sheet.addRow({
      date: new Date(e.createdAt).toLocaleString('en-IN'),
      name: e.name, mobile: e.mobile, service: e.service,
      preferredDate: e.preferredDate, message: (e.message || '').slice(0, 500)
    });
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = {
  listEnquiries,
  saveEnquiry,
  deleteEnquiry,
  deleteOldEnquiries,
  generatePdf,
  generateExcel
};
