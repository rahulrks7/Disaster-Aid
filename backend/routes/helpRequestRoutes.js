const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  updateRequest,
} = require('../controllers/helpRequestController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.post('/', protect, createRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/', protect, authorize('admin'), getAllRequests);
router.get('/:id', protect, getRequestById);
router.patch('/:id/status', protect, authorize('admin'), updateRequestStatus);
router.patch('/:id', protect, updateRequest);

module.exports = router;
