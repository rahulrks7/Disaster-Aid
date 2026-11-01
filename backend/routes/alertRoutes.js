const express = require('express');
const router = express.Router();
const {
  getActiveAlerts,
  getAllAlerts,
  createAlert,
  updateAlert,
  deactivateAlert,
  deleteAlert,
} = require('../controllers/alertController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// Public active alert stream
router.get('/active', getActiveAlerts);

// Admin management
router.get('/', protect, authorize('admin'), getAllAlerts);
router.post('/', protect, authorize('admin'), createAlert);
router.patch('/:id', protect, authorize('admin'), updateAlert);
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateAlert);
router.delete('/:id', protect, authorize('admin'), deleteAlert);

module.exports = router;
