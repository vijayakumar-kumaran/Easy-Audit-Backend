const mongoose = require('mongoose');

const CustomerITNoticeSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  transactionId: { type: String, default: '' },
  assesseeType: { type: String, default: '' },
  assesseeName: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  dob: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  adharNumber: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  noticeType: { type: String, default: '' },
  noticeDescription: { type: String, default: '' },
  document: { type: String, default: null },
  dueDate: { type: Date },
  assignedTo: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  notes: { type: String, default: '' },
  comments: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CustomerITNotice', CustomerITNoticeSchema);
