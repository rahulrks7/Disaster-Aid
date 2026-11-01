const express = require('express');
const router = express.Router();
const {
  getAllShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
} = require('../controllers/shelterController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// Public endpoints
router.get('/', getAllShelters);
router.get('/:id', getShelterById);

// Admin endpoints
router.post('/', protect, authorize('admin'), createShelter);
router.patch('/:id', protect, authorize('admin'), updateShelter);
router.delete('/:id', protect, authorize('admin'), deleteShelter);

module.exports = router;
