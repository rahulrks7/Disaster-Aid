const express = require('express');
const router = express.Router();
const {
  getAllResources,
  createResource,
  updateResource,
  recordTransaction,
  getResourceTransactions,
} = require('../controllers/resourceController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.get('/', protect, getAllResources);
router.post('/', protect, authorize('admin'), createResource);
router.patch('/:id', protect, authorize('admin'), updateResource);
router.post('/:id/transactions', protect, authorize('admin'), recordTransaction);
router.get('/:id/transactions', protect, authorize('admin'), getResourceTransactions);

module.exports = router;
