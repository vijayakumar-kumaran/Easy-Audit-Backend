const express = require('express');
const router = express.Router();
const TransactionLog = require('../models/TransactionLog');
const CustomerTaxAssessment = require('../models/CustomerTaxAssessment');
const CustomerITNotice = require('../models/CustomerITNotice');
const BusinessTaxAssessment = require('../models/BusinessTaxAssessment');
const BusinessITNotice = require('../models/BusinessITNotice');
const { requireLogin } = require('../middleware/auth');

router.get('/transactions', requireLogin, async (req, res) => {
  try {
    const { username, usertype } = req.session.user;

    if (usertype === 'admin' || usertype === 'superuser') {
      // Admins and supervisors can view all transaction logs
      const logs = await TransactionLog.find({}).sort({ createdAt: -1 });
      return res.json(logs);
    } else if (usertype === 'audituser') {
      // Auditors only see transactions that they performed or that affect their assigned clients
      // 1. Get client names assigned to this auditor
      const assignedTaxes = await CustomerTaxAssessment.find({ assignedTo: username });
      const assignedNotices = await CustomerITNotice.find({ assignedTo: username });
      const assignedBusTaxes = await BusinessTaxAssessment.find({ assignedTo: username });
      const assignedBusNotices = await BusinessITNotice.find({ assignedTo: username });

      const clientNames = new Set();
      assignedTaxes.forEach(t => clientNames.add(t.assesseName));
      assignedNotices.forEach(n => clientNames.add(n.assesseeName));
      assignedBusTaxes.forEach(t => clientNames.add(t.businessName));
      assignedBusNotices.forEach(n => clientNames.add(n.businessName));

      const clientNamesArray = Array.from(clientNames);

      // 2. Find logs performed by auditor or regarding their clients
      const logs = await TransactionLog.find({
        $or: [
          { performedBy: username },
          { clientName: { $in: clientNamesArray } }
        ]
      }).sort({ createdAt: -1 });

      return res.json(logs);
    } else {
      return res.status(403).json({ error: 'Role unauthorized.' });
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error fetching transaction history' });
  }
});

module.exports = router;
