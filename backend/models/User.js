const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  usertype: {
    type: String,
    required: true,
    enum: ['admin', 'audituser', 'superuser'],
    default: 'audituser'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
