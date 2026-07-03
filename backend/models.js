const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  usertype: { type: String, required: true, enum: ['admin', 'audituser'] },
  avatar: String
});

// Business Signup Schema
const BusinessSignupSchema = new mongoose.Schema({
  assesseeType: String,
  businessName: { type: String, required: true },
  businessOwnerName: String,
  typeOfBusiness: String,
  businessRegistrationNumber: String,
  panOfBusiness: String,
  gstin: String,
  signatoryAuthorityName: String,
  bankName: String,
  branchName: String,
  bankAccountNumber: String,
  ifscCode: String,
  streetAddress: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  dscPassword: String,
  contactPhoneNumber: String,
  contactEmail: String,
  contactPersonName: String,
  notes: String,
  panCardFile: String,
  gstinFile: String,
  otherDocumentFile: String
}, { timestamps: true });

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  assesseeType: String,
  assesseefirstName: { type: String, required: true },
  assesseelastName: String,
  fatherHusbandName: String,
  maritialstatus: String,
  day: String,
  month: String,
  year: String,
  bankName: String,
  branchName: String,
  bankAccountNumber: String,
  ifscCode: String,
  panNumber: String,
  aadharNumber: String,
  contactPersonName: String,
  emailAddress: String,
  phoneNumber: String,
  streetAddress: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  dscPassword: String,
  panCardFile: String,
  adharCardFile: String,
  otherDocumentFile: String
}, { timestamps: true });

// Business Tax Assessment Schema
const BusinessTaxAssessmentSchema = new mongoose.Schema({
  business_listID: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessSignup' },
  assesseeType: String,
  businessName: String,
  businessOwnerName: String,
  typeOfBusiness: String,
  businessRegistrationNumber: String,
  panOfBusiness: String,
  gstin: String,
  contactPersonName: String,
  assessmentYear: String,
  notes: String,
  document: String,
  assignedTo: String,
  status: { type: String, default: 'Pending' },
  comments: String
}, { timestamps: true });

// Customer Tax Assessment Schema
const CustomerTaxAssessmentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  assesseeType: String,
  assesseName: String,
  fatherName: String,
  dob: String,
  panNumber: String,
  adharNumber: String,
  phoneNumber: String,
  assessmentYear: String,
  notes: String,
  document: String,
  assignedTo: String,
  status: { type: String, default: 'Pending' },
  comments: String
}, { timestamps: true });

// Business IT Notice Schema
const BusinessITNoticeSchema = new mongoose.Schema({
  businessID: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessSignup' },
  assesseeType: String,
  businessName: String,
  businessOwnerName: String,
  typeOfBusiness: String,
  contactPersonName: String,
  noticeType: String,
  noticeDescription: String,
  document: String,
  dueDate: Date,
  assignedTo: String,
  status: { type: String, default: 'Pending' },
  notes: String,
  comments: String
}, { timestamps: true });

// Customer IT Notice Schema
const CustomerITNoticeSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  assesseeType: String,
  assesseeName: String,
  fatherName: String,
  dob: String,
  panNumber: String,
  adharNumber: String,
  phoneNumber: String,
  noticeType: String,
  noticeDescription: String,
  document: String,
  dueDate: Date,
  assignedTo: String,
  status: { type: String, default: 'Pending' },
  notes: String,
  comments: String
}, { timestamps: true });

// Dropdown/Static Schemas
const BusinessAssessmentTypeSchema = new mongoose.Schema({
  item_id: { type: Number, required: true, unique: true },
  bassessmentvalues: { type: String, required: true }
});

const BusinessNoticeTypeSchema = new mongoose.Schema({
  item_id: { type: Number, required: true, unique: true },
  noticetype: { type: String, required: true },
  noticedescription: String
});

const IndividualNoticeTypeSchema = new mongoose.Schema({
  item_id: { type: Number, required: true, unique: true },
  noticetype: { type: String, required: true },
  noticedescription: String
});

// Compile Models
const User = mongoose.model('User', UserSchema);
const BusinessSignup = mongoose.model('BusinessSignup', BusinessSignupSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const BusinessTaxAssessment = mongoose.model('BusinessTaxAssessment', BusinessTaxAssessmentSchema);
const CustomerTaxAssessment = mongoose.model('CustomerTaxAssessment', CustomerTaxAssessmentSchema);
const BusinessITNotice = mongoose.model('BusinessITNotice', BusinessITNoticeSchema);
const CustomerITNotice = mongoose.model('CustomerITNotice', CustomerITNoticeSchema);
const BusinessAssessmentType = mongoose.model('BusinessAssessmentType', BusinessAssessmentTypeSchema);
const BusinessNoticeType = mongoose.model('BusinessNoticeType', BusinessNoticeTypeSchema);
const IndividualNoticeType = mongoose.model('IndividualNoticeType', IndividualNoticeTypeSchema);

module.exports = {
  User,
  BusinessSignup,
  Customer,
  BusinessTaxAssessment,
  CustomerTaxAssessment,
  BusinessITNotice,
  CustomerITNotice,
  BusinessAssessmentType,
  BusinessNoticeType,
  IndividualNoticeType
};
