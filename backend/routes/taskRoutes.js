const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getAvailableTasks,
  getMyTasks,
  getTaskById,
  assignVolunteers,
  acceptTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.get('/available', protect, authorize('volunteer', 'admin'), getAvailableTasks);
router.get('/my-tasks', protect, authorize('volunteer', 'admin'), getMyTasks);

router.post('/', protect, authorize('admin'), createTask);
router.get('/', protect, authorize('admin', 'volunteer'), getAllTasks);
router.get('/:id', protect, getTaskById);

router.patch('/:id/assign', protect, authorize('admin'), assignVolunteers);
router.patch('/:id/accept', protect, authorize('volunteer', 'admin'), acceptTask);
router.patch('/:id/status', protect, authorize('volunteer', 'admin'), updateTaskStatus);

module.exports = router;
