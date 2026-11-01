const DisasterReport = require('../models/DisasterReport');
const Notification = require('../models/Notification');
const { logAction } = require('../utils/auditLogger');
const { notifyUser, broadcastEvent } = require('../utils/socket');

// @desc    Create a new disaster report
// @route   POST /api/v1/disasters
// @access  Private (Citizen / Admin / Volunteer)
const createReport = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      severity,
      locationName,
      latitude,
      longitude,
      affectedCount,
    } = req.body;

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const lng = parseFloat(longitude) || 77.209;
    const lat = parseFloat(latitude) || 28.6139;

    const report = await DisasterReport.create({
      title,
      category,
      description,
      severity: severity || 'medium',
      locationName,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      affectedCount: Number(affectedCount) || 0,
      images: imageUrls,
      reporter: req.user._id,
      verificationStatus: req.user.role === 'admin' ? 'verified' : 'pending',
      responseStatus: 'reported',
      verifiedBy: req.user.role === 'admin' ? req.user._id : undefined,
      verifiedAt: req.user.role === 'admin' ? new Date() : undefined,
    });

    await logAction({
      req,
      action: 'DISASTER_REPORTED',
      targetModel: 'DisasterReport',
      targetId: report._id,
      details: `Report #${report.reportId} created: "${report.title}" (${report.category}, ${report.severity}) by ${req.user.name}`,
    });

    // Notify admins in real-time
    broadcastEvent('disaster:new', {
      reportId: report.reportId,
      title: report.title,
      category: report.category,
      severity: report.severity,
      locationName: report.locationName,
    });

    res.status(201).json({
      success: true,
      message: 'Disaster report submitted successfully and queued for verification.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all disaster reports with search, filter, pagination
// @route   GET /api/v1/disasters
// @access  Private / Public (Public sees verified only unless authenticated as Admin)
const getAllReports = async (req, res, next) => {
  try {
    const {
      category,
      severity,
      verificationStatus,
      responseStatus,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // If not admin, only show verified reports or user's own reports
    if (!req.user || req.user.role !== 'admin') {
      if (req.user) {
        query.$or = [{ verificationStatus: 'verified' }, { reporter: req.user._id }];
      } else {
        query.verificationStatus = 'verified';
      }
    } else {
      if (verificationStatus) {
        query.verificationStatus = verificationStatus;
      }
    }

    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (responseStatus) query.responseStatus = responseStatus;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { locationName: { $regex: search, $options: 'i' } },
        { reportId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await DisasterReport.countDocuments(query);
    const reports = await DisasterReport.find(query)
      .populate('reporter', 'name email phone')
      .populate('verifiedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verified disaster reports for public interactive map
// @route   GET /api/v1/disasters/map
// @access  Public
const getPublicVerifiedReports = async (req, res, next) => {
  try {
    const { category, severity } = req.query;
    const query = { verificationStatus: 'verified' };

    if (category) query.category = category;
    if (severity) query.severity = severity;

    const reports = await DisasterReport.find(query)
      .select('reportId title category severity locationName location affectedCount images responseStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports submitted by current user
// @route   GET /api/v1/disasters/my-reports
// @access  Private (Citizen)
const getMyReports = async (req, res, next) => {
  try {
    const reports = await DisasterReport.find({ reporter: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single disaster report by ID
// @route   GET /api/v1/disasters/:id
// @access  Private / Public
const getReportById = async (req, res, next) => {
  try {
    const report = await DisasterReport.findById(req.params.id)
      .populate('reporter', 'name email phone')
      .populate('verifiedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disaster report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject a disaster report
// @route   PATCH /api/v1/disasters/:id/verify
// @access  Private (Admin only)
const verifyReport = async (req, res, next) => {
  try {
    const { verificationStatus, adminNotes } = req.body;

    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'verified' or 'rejected'",
      });
    }

    const report = await DisasterReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.verificationStatus = verificationStatus;
    report.verifiedBy = req.user._id;
    report.verifiedAt = new Date();
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    await report.save();

    await logAction({
      req,
      action: `REPORT_${verificationStatus.toUpperCase()}`,
      targetModel: 'DisasterReport',
      targetId: report._id,
      details: `Report #${report.reportId} was marked as ${verificationStatus} by Admin ${req.user.name}. Note: ${adminNotes || 'None'}`,
    });

    // Create notification for reporter
    const notif = await Notification.create({
      recipient: report.reporter,
      title: `Disaster Report #${report.reportId} ${verificationStatus === 'verified' ? 'Verified' : 'Rejected'}`,
      message: `Your incident report "${report.title}" has been reviewed and marked as ${verificationStatus}. ${adminNotes ? 'Admin remarks: ' + adminNotes : ''}`,
      type: 'report',
      link: `/citizen/my-reports`,
    });

    notifyUser(report.reporter.toString(), notif);
    broadcastEvent('disaster:updated', { id: report._id, verificationStatus });

    res.status(200).json({
      success: true,
      message: `Report has been successfully ${verificationStatus}.`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update response status of a disaster report
// @route   PATCH /api/v1/disasters/:id/status
// @access  Private (Admin only)
const updateReportStatus = async (req, res, next) => {
  try {
    const { responseStatus, adminNotes } = req.body;

    if (!['reported', 'response_in_progress', 'resolved'].includes(responseStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response status',
      });
    }

    const report = await DisasterReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.responseStatus = responseStatus;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    await report.save();

    await logAction({
      req,
      action: 'REPORT_STATUS_UPDATED',
      targetModel: 'DisasterReport',
      targetId: report._id,
      details: `Report #${report.reportId} response status changed to ${responseStatus}`,
    });

    // Notify reporter
    const notif = await Notification.create({
      recipient: report.reporter,
      title: `Incident #${report.reportId} Update: ${responseStatus.replace('_', ' ').toUpperCase()}`,
      message: `Status updated for your report "${report.title}". Current stage: ${responseStatus}.`,
      type: 'report',
      link: `/citizen/my-reports`,
    });
    notifyUser(report.reporter.toString(), notif);
    broadcastEvent('disaster:updated', { id: report._id, responseStatus });

    res.status(200).json({
      success: true,
      message: `Incident status updated to ${responseStatus}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report details (Citizen owner can update description before verification)
// @route   PATCH /api/v1/disasters/:id
// @access  Private
const updateReport = async (req, res, next) => {
  try {
    const report = await DisasterReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && report.reporter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this report' });
    }

    const { title, description, severity, locationName, affectedCount } = req.body;
    if (title) report.title = title;
    if (description) report.description = description;
    if (severity && req.user.role === 'admin') report.severity = severity;
    if (locationName) report.locationName = locationName;
    if (affectedCount !== undefined) report.affectedCount = affectedCount;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getAllReports,
  getPublicVerifiedReports,
  getMyReports,
  getReportById,
  verifyReport,
  updateReportStatus,
  updateReport,
};
