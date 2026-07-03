const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  aadhaarNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  dateOfJoining: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  wsaccount: { type: Boolean, default: false },
});

module.exports = mongoose.model('Employee', employeeSchema);
