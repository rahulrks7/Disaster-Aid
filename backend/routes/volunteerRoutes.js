const express = require('express');
const router = express.Router();
const {
  getAllVolunteers,
  getMyVolunteerProfile,
  updateMyVolunteerProfile,
  getVolunteerById,
  updateVolunteerStatusAdmin,
} = require('../controllers/volunteerController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.get('/me', protect, authorize('volunteer', 'admin'), getMyVolunteerProfile);
router.patch('/me', protect, authorize('volunteer', 'admin'), updateMyVolunteerProfile);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllVolunteers);
router.get('/:id', protect, authorize('admin'), getVolunteerById);
router.patch('/:id/status', protect, authorize('admin'), updateVolunteerStatusAdmin);

module.exports = router;
