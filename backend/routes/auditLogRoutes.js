const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.get('/', protect, authorize('admin'), getAuditLogs);

module.exports = router;
