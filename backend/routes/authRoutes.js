const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/audit-users', authController.getAuditUsers);
router.get('/admin-users', authController.getAdminUsers);
router.get('/dashboard-stats', authController.getDashboardStats);

module.exports = router;
