const HelpRequest = require('../models/HelpRequest');
const Notification = require('../models/Notification');
const { logAction } = require('../utils/auditLogger');
const { notifyUser, broadcastEvent } = require('../utils/socket');

// @desc    Create a new emergency help request
// @route   POST /api/v1/help-requests
// @access  Private (Citizen / All)
const createRequest = async (req, res, next) => {
  try {
    const {
      requestType,
      description,
      locationName,
      latitude,
      longitude,
      affectedPeople,
      priority,
      contactPhone,
    } = req.body;

    const lng = parseFloat(longitude) || 77.209;
    const lat = parseFloat(latitude) || 28.6139;

    const helpRequest = await HelpRequest.create({
      requestType,
      description,
      locationName,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      affectedPeople: Number(affectedPeople) || 1,
      priority: priority || 'high',
      status: 'pending',
      requester: req.user._id,
      contactPhone: contactPhone || req.user.phone || '',
    });

    await logAction({
      req,
      action: 'HELP_REQUEST_CREATED',
      targetModel: 'HelpRequest',
      targetId: helpRequest._id,
      details: `Emergency request #${helpRequest.requestId} created for ${requestType} by ${req.user.name}`,
    });

    broadcastEvent('help_request:new', {
      requestId: helpRequest.requestId,
      requestType: helpRequest.requestType,
      priority: helpRequest.priority,
      locationName: helpRequest.locationName,
    });

    res.status(201).json({
      success: true,
      message: 'Emergency help request submitted. Coordination teams have been notified.',
      data: helpRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all help requests with filters (Admin view)
// @route   GET /api/v1/help-requests
// @access  Private (Admin)
const getAllRequests = async (req, res, next) => {
  try {
    const {
      requestType,
      priority,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (requestType) query.requestType = requestType;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { locationName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await HelpRequest.countDocuments(query);
    const requests = await HelpRequest.find(query)
      .populate('requester', 'name email phone')
      .populate('assignedTask', 'taskId title status')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get help requests submitted by current user
// @route   GET /api/v1/help-requests/my-requests
// @access  Private (Citizen)
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await HelpRequest.find({ requester: req.user._id })
      .populate('assignedTask', 'taskId title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single help request by ID
// @route   GET /api/v1/help-requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('assignedTask');

    if (!helpRequest) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    // Ownership check for citizens
    if (req.user.role === 'citizen' && helpRequest.requester._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden' });
    }

    res.status(200).json({
      success: true,
      data: helpRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status or priority
// @route   PATCH /api/v1/help-requests/:id/status
// @access  Private (Admin)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, priority, adminNotes, assignedTaskId } = req.body;

    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (status) {
      if (!['pending', 'accepted', 'in_progress', 'fulfilled', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      helpRequest.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
        return res.status(400).json({ success: false, message: 'Invalid priority' });
      }
      helpRequest.priority = priority;
    }

    if (adminNotes !== undefined) helpRequest.adminNotes = adminNotes;
    if (assignedTaskId) helpRequest.assignedTask = assignedTaskId;

    await helpRequest.save();

    await logAction({
      req,
      action: 'HELP_REQUEST_STATUS_UPDATED',
      targetModel: 'HelpRequest',
      targetId: helpRequest._id,
      details: `Help Request #${helpRequest.requestId} updated to status: ${helpRequest.status}, priority: ${helpRequest.priority}`,
    });

    // Notify requester
    const notif = await Notification.create({
      recipient: helpRequest.requester,
      title: `Help Request #${helpRequest.requestId} Status: ${helpRequest.status.toUpperCase()}`,
      message: `Your emergency request for ${helpRequest.requestType} has been updated to "${helpRequest.status}". Priority: ${helpRequest.priority}.`,
      type: 'request',
      link: `/citizen/my-requests`,
    });
    notifyUser(helpRequest.requester.toString(), notif);
    broadcastEvent('help_request:updated', { id: helpRequest._id, status: helpRequest.status });

    res.status(200).json({
      success: true,
      message: 'Help request updated successfully',
      data: helpRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update / Cancel citizen's own request
// @route   PATCH /api/v1/help-requests/:id
// @access  Private (Citizen)
const updateRequest = async (req, res, next) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (req.user.role !== 'admin' && helpRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this request' });
    }

    const { description, affectedPeople, contactPhone, status } = req.body;

    if (description) helpRequest.description = description;
    if (affectedPeople) helpRequest.affectedPeople = affectedPeople;
    if (contactPhone) helpRequest.contactPhone = contactPhone;
    
    // Allow citizen to cancel their own request if pending
    if (status === 'cancelled' && ['pending', 'accepted'].includes(helpRequest.status)) {
      helpRequest.status = 'cancelled';
    }

    await helpRequest.save();

    res.status(200).json({
      success: true,
      message: 'Help request updated successfully',
      data: helpRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  updateRequest,
};
