const mongoose = require('mongoose');

const BusinessITNoticeSchema = new mongoose.Schema({
  businessID: { type: String, required: true },
  transactionId: { type: String, default: '' },
  assesseeType: { type: String, default: '' },
  businessName: { type: String, default: '' },
  businessOwnerName: { type: String, default: '' },
  typeOfBusiness: { type: String, default: '' },
  contactPersonName: { type: String, default: '' },
  noticeType: { type: String, default: '' },
  noticeDescription: { type: String, default: '' },
  document: { type: String, default: null },
  dueDate: { type: Date },
  assignedTo: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  notes: { type: String, default: '' },
  comments: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('BusinessITNotice', BusinessITNoticeSchema);
