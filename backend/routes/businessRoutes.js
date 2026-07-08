const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const upload = require('../config/multer');

// Business dropdown options
router.get('/business-assessment-types', businessController.getBusinessAssessmentTypes);
router.get('/bus-notice-types', businessController.getBusinessNoticeTypes);

// Business profiles
router.post('/business-signup', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'gstinFile', maxCount: 1 },
  { name: 'otherDocumentFile', maxCount: 1 }
]), businessController.businessSignup);

router.get('/business_list', businessController.getBusinesses);
router.get('/business_list/:id', businessController.getBusinessById);

router.put('/business_list/:id', upload.fields([
  { name: 'panCardFile', maxCount: 1 },
  { name: 'gstinFile', maxCount: 1 }, // Note: frontend uses gstinFile or gtsinfile, we support both
  { name: 'otherDocumentFile', maxCount: 1 }
]), businessController.updateBusiness);

router.delete('/business_list/:id', businessController.deleteBusiness);

// Business Tax assessments
router.post('/business-tax-assessments', upload.single('document'), businessController.createBusinessTaxAssessment);
router.get('/list-of-tax-assessments-all', businessController.getAllBusinessTaxAssessments);
router.get('/list-of-tax-assessments', businessController.getAssignedBusinessTaxAssessments);
router.get('/update-tax-assessments/:id', businessController.getBusinessTaxAssessmentById);
router.put('/updated-tax-assessments/:id', upload.single('document'), businessController.updateBusinessTaxAssessment);

// Business IT notices
router.post('/bus-it-notices', upload.single('document'), businessController.createBusinessITNotice);
router.get('/bus-it-notices-all', businessController.getAllBusinessITNotices);
router.get('/bus-it-notices', businessController.getAssignedBusinessITNotices);
router.get('/bus-it-notice/:id', businessController.getBusinessITNoticeById);
router.put('/business-it-notices/:id', upload.single('document'), businessController.updateBusinessITNotice);

module.exports = router;
