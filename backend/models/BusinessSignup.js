const mongoose = require('mongoose');

const BusinessSignupSchema = new mongoose.Schema({
  transactionId: { type: String, default: '' },
  assesseeType: { type: String, default: '' },
  businessName: { type: String, required: true },
  businessOwnerName: { type: String, default: '' },
  typeOfBusiness: { type: String, default: '' },
  businessRegistrationNumber: { type: String, default: '' },
  panOfBusiness: { type: String, default: '' },
  gstin: { type: String, default: '' },
  signatoryAuthorityName: { type: String, default: '' },
  bankName: { type: String, default: '' },
  branchName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  streetAddress: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },
  dscPassword: { type: String, default: '' },
  contactPhoneNumber: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPersonName: { type: String, default: '' },
  notes: { type: String, default: '' },
  panCardFile: { type: String, default: null },
  gstinFile: { type: String, default: null },
  otherDocumentFile: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('BusinessSignup', BusinessSignupSchema);
