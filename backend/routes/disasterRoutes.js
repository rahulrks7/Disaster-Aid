const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getPublicVerifiedReports,
  getMyReports,
  getReportById,
  verifyReport,
  updateReportStatus,
  updateReport,
} = require('../controllers/disasterController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// Public map feed
router.get('/map', getPublicVerifiedReports);

// Private routes
router.post('/', protect, upload.array('images', 5), createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/', protect, getAllReports);
router.get('/:id', protect, getReportById);
router.patch('/:id', protect, updateReport);

// Admin only routes
router.patch('/:id/verify', protect, authorize('admin'), verifyReport);
router.patch('/:id/status', protect, authorize('admin'), updateReportStatus);

module.exports = router;
