const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  transactionId: { type: String, default: '' },
  assesseeType: { type: String, default: '' },
  assesseefirstName: { type: String, required: true },
  assesseelastName: { type: String, required: true },
  fatherHusbandName: { type: String, default: '' },
  maritialstatus: { type: String, default: '' },
  day: { type: String, default: '' },
  month: { type: String, default: '' },
  year: { type: String, default: '' },
  bankName: { type: String, default: '' },
  branchName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  aadharNumber: { type: String, default: '' },
  contactPersonName: { type: String, default: '' },
  emailAddress: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  streetAddress: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },
  dscPassword: { type: String, default: '' },
  panCardFile: { type: String, default: null },
  adharCardFile: { type: String, default: null },
  otherDocumentFile: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
