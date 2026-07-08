const mongoose = require('mongoose');

const BusinessTaxAssessmentSchema = new mongoose.Schema({
  business_listID: { type: String, required: true },
  transactionId: { type: String, default: '' },
  assesseeType: { type: String, default: '' },
  businessName: { type: String, default: '' },
  businessOwnerName: { type: String, default: '' },
  typeOfBusiness: { type: String, default: '' },
  businessRegistrationNumber: { type: String, default: '' },
  panOfBusiness: { type: String, default: '' },
  gstin: { type: String, default: '' },
  contactPersonName: { type: String, default: '' },
  assessmentYear: { type: String, default: '' },
  notes: { type: String, default: '' },
  document: { type: String, default: null },
  assignedTo: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  comments: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('BusinessTaxAssessment', BusinessTaxAssessmentSchema);
