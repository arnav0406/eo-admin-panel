const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/adminAuth');

// All admin data routes require authentication
router.get('/stats', adminAuth, adminController.getStats);
router.get('/accounts', adminAuth, adminController.getAccounts);
router.put('/accounts/:id/toggle', adminAuth, adminController.toggleAccount);
router.get('/documents', adminAuth, adminController.getDocuments);
router.get('/audit-logs', adminAuth, adminController.getAuditLogs);

module.exports = router;
