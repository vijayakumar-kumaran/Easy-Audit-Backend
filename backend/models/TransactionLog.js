const mongoose = require('mongoose');

const TransactionLogSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., 'Client Register', 'Tax Created', 'Tax Status Update', etc.
  category: { type: String, required: true }, // 'Individual' or 'Business'
  clientName: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: String, required: true },
  role: { type: String, required: true },
  referenceId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TransactionLog', TransactionLogSchema);
