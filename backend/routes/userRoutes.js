const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

router.get('/', protect, authorize('admin'), getAllUsers);
router.patch('/:id', protect, authorize('admin'), updateUser);

module.exports = router;
