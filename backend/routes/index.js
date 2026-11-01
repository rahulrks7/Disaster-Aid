const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const disasterRoutes = require('./disasterRoutes');
const helpRequestRoutes = require('./helpRequestRoutes');
const volunteerRoutes = require('./volunteerRoutes');
const taskRoutes = require('./taskRoutes');
const resourceRoutes = require('./resourceRoutes');
const shelterRoutes = require('./shelterRoutes');
const alertRoutes = require('./alertRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const userRoutes = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const auditLogRoutes = require('./auditLogRoutes');

router.use('/auth', authRoutes);
router.use('/disasters', disasterRoutes);
router.use('/help-requests', helpRequestRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/tasks', taskRoutes);
router.use('/resources', resourceRoutes);
router.use('/shelters', shelterRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DisasterAid REST API v1 is operating nominally.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
