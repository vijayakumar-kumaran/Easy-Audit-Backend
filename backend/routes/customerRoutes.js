const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const upload = require('../config/multer');

// Customer routes
router.post('/customer-signup', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'adharCardFile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), customerController.customerSignup);

router.get('/customers', customerController.getCustomers);
router.get('/customers/:id', customerController.getCustomerById);

router.put('/customers/:id', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'adharCardFile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), customerController.updateCustomer);

router.delete('/customers/:id', customerController.deleteCustomer);

// Customer Tax assessments
router.post('/customer-tax-assessments', upload.single('document'), customerController.createTaxAssessment);
router.get('/customer-tax-assessments-all', customerController.getAllTaxAssessments);
router.get('/customer-tax-assessments', customerController.getAssignedTaxAssessments);
router.get('/customer-tax-assessments/:id', customerController.getTaxAssessmentById);
router.put('/customer-tax-assessments/:id', upload.single('document'), customerController.updateTaxAssessment);

// Customer IT notices
router.get('/notice-types', customerController.getNoticeTypes);
router.post('/customer-it-notices', upload.single('document'), customerController.createITNotice);
router.get('/it-notices-all', customerController.getAllITNotices);
router.get('/it-notices', customerController.getAssignedITNotices);
router.get('/customer-it-notices/:id', customerController.getITNoticeById);
router.put('/customer-it-notices/:id', upload.single('document'), customerController.updateITNotice);

module.exports = router;
