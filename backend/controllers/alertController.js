const Alert = require('../models/Alert');
const { logAction } = require('../utils/auditLogger');
const { broadcastEvent } = require('../utils/socket');

// @desc    Get all active, non-expired emergency alerts
// @route   GET /api/v1/alerts/active
// @access  Public
const getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({
      isActive: true,
      expiryTime: { $gt: new Date() },
    })
      .populate('createdBy', 'name')
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all alerts (Admin view with historical & expired)
// @route   GET /api/v1/alerts
// @access  Private (Admin)
const getAllAlerts = async (req, res, next) => {
  try {
    const { category, severity, isActive, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { affectedArea: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new emergency alert
// @route   POST /api/v1/alerts
// @access  Private (Admin)
const createAlert = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      affectedArea,
      latitude,
      longitude,
      startTime,
      expiryTime,
    } = req.body;

    const lng = parseFloat(longitude) || 77.209;
    const lat = parseFloat(latitude) || 28.6139;

    const alert = await Alert.create({
      title,
      description,
      category: category || 'general_emergency',
      severity: severity || 'high',
      affectedArea,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      startTime: startTime || new Date(),
      expiryTime: expiryTime || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
      createdBy: req.user._id,
      isActive: true,
    });

    await logAction({
      req,
      action: 'ALERT_PUBLISHED',
      targetModel: 'Alert',
      targetId: alert._id,
      details: `Emergency Alert published: "${alert.title}" (${alert.severity}) for ${alert.affectedArea}`,
    });

    // Real-time broadcast to all connected clients
    broadcastEvent('alert:new', {
      alertId: alert.alertId,
      title: alert.title,
      description: alert.description,
      category: alert.category,
      severity: alert.severity,
      affectedArea: alert.affectedArea,
      expiryTime: alert.expiryTime,
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert broadcasted successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update alert
// @route   PATCH /api/v1/alerts/:id
// @access  Private (Admin)
const updateAlert = async (req, res, next) => {
  try {
    const { title, description, category, severity, affectedArea, expiryTime, isActive } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (title) alert.title = title;
    if (description) alert.description = description;
    if (category) alert.category = category;
    if (severity) alert.severity = severity;
    if (affectedArea) alert.affectedArea = affectedArea;
    if (expiryTime) alert.expiryTime = new Date(expiryTime);
    if (isActive !== undefined) alert.isActive = Boolean(isActive);

    await alert.save();

    await logAction({
      req,
      action: 'ALERT_UPDATED',
      targetModel: 'Alert',
      targetId: alert._id,
      details: `Alert "${alert.title}" updated`,
    });

    broadcastEvent('alert:updated', alert);

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate alert
// @route   PATCH /api/v1/alerts/:id/deactivate
// @access  Private (Admin)
const deactivateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.isActive = false;
    await alert.save();

    await logAction({
      req,
      action: 'ALERT_DEACTIVATED',
      targetModel: 'Alert',
      targetId: alert._id,
      details: `Alert "${alert.title}" deactivated`,
    });

    broadcastEvent('alert:deactivated', { id: alert._id });

    res.status(200).json({
      success: true,
      message: 'Alert deactivated',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/v1/alerts/:id
// @access  Private (Admin)
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await logAction({
      req,
      action: 'ALERT_DELETED',
      targetModel: 'Alert',
      targetId: alert._id,
      details: `Alert "${alert.title}" deleted`,
    });

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAlerts,
  getAllAlerts,
  createAlert,
  updateAlert,
  deactivateAlert,
  deleteAlert,
};
