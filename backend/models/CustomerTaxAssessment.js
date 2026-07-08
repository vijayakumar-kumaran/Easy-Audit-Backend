const mongoose = require('mongoose');

const CustomerTaxAssessmentSchema = new mongoose.Schema({
  customerId: { type: String, required: true }, // can match individual client's _id
  transactionId: { type: String, default: '' },
  assesseeType: { type: String, default: '' },
  assesseName: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  dob: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  adharNumber: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  assessmentYear: { type: String, default: '' },
  notes: { type: String, default: '' },
  document: { type: String, default: null },
  assignedTo: { type: String, default: '' }, // audit user username
  status: { type: String, default: 'Pending' },
  comments: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CustomerTaxAssessment', CustomerTaxAssessmentSchema);
