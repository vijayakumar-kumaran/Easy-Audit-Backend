const TransactionLog = require('../models/TransactionLog');
const Notification = require('../models/Notification');

const generateTransactionId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000); // 5 digits
  return `EA-TXN-${year}-${rand}`;
};

const createLogAndNotify = async ({
  type,
  category,
  clientName,
  description,
  performedBy,
  role,
  referenceId,
  recipient,
  notifyTitle,
  notifyMsg,
  link
}) => {
  const transactionId = generateTransactionId();
  
  // Save Log
  const log = new TransactionLog({
    transactionId,
    type,
    category,
    clientName,
    description: `${description} (Txn: ${transactionId})`,
    performedBy,
    role,
    referenceId
  });
  await log.save();

  // If notification info is provided, send notification
  if (recipient && notifyTitle && notifyMsg) {
    const notification = new Notification({
      recipient,
      sender: performedBy || 'System',
      title: notifyTitle,
      message: notifyMsg,
      link
    });
    await notification.save();
  }

  return transactionId;
};

module.exports = { generateTransactionId, createLogAndNotify };
