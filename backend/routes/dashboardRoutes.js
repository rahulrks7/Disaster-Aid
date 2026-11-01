const express = require('express');
const router = express.Router();
const {
  getAdminSummary,
  getAdminAnalytics,
  getCitizenSummary,
  getVolunteerSummary,
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.get('/summary', protect, authorize('admin'), getAdminSummary);
router.get('/analytics', protect, authorize('admin'), getAdminAnalytics);
router.get('/citizen', protect, authorize('citizen', 'admin'), getCitizenSummary);
router.get('/volunteer', protect, authorize('volunteer', 'admin'), getVolunteerSummary);

module.exports = router;
