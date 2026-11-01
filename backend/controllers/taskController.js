const ResponseTask = require('../models/ResponseTask');
const VolunteerProfile = require('../models/VolunteerProfile');
const DisasterReport = require('../models/DisasterReport');
const HelpRequest = require('../models/HelpRequest');
const Notification = require('../models/Notification');
const { logAction } = require('../utils/auditLogger');
const { notifyUser, broadcastEvent } = require('../utils/socket');

// @desc    Create a response task (Admin)
// @route   POST /api/v1/tasks
// @access  Private (Admin)
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      disasterReport,
      helpRequest,
      assignedVolunteers,
      priority,
      locationName,
      latitude,
      longitude,
    } = req.body;

    const lng = parseFloat(longitude) || 77.209;
    const lat = parseFloat(latitude) || 28.6139;

    const initialStatus = assignedVolunteers && assignedVolunteers.length > 0 ? 'assigned' : 'open';

    const task = await ResponseTask.create({
      title,
      description,
      disasterReport: disasterReport || undefined,
      helpRequest: helpRequest || undefined,
      assignedVolunteers: assignedVolunteers || [],
      priority: priority || 'medium',
      locationName,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      status: initialStatus,
      createdBy: req.user._id,
      statusHistory: [
        {
          status: initialStatus,
          changedBy: req.user._id,
          timestamp: new Date(),
          note: 'Task created',
        },
      ],
    });

    // If linked to help request, update help request
    if (helpRequest) {
      await HelpRequest.findByIdAndUpdate(helpRequest, {
        assignedTask: task._id,
        status: 'in_progress',
      });
    }

    // If linked to disaster report, update response status
    if (disasterReport) {
      await DisasterReport.findByIdAndUpdate(disasterReport, {
        responseStatus: 'response_in_progress',
      });
    }

    // Notify assigned volunteers
    if (assignedVolunteers && assignedVolunteers.length > 0) {
      for (const volId of assignedVolunteers) {
        const notif = await Notification.create({
          recipient: volId,
          title: `New Task Assigned: ${task.title}`,
          message: `You have been assigned to response task "${task.title}" at ${task.locationName}. Priority: ${task.priority}.`,
          type: 'task',
          link: '/volunteer/my-tasks',
        });
        notifyUser(volId.toString(), notif);
      }
    }

    await logAction({
      req,
      action: 'TASK_CREATED',
      targetModel: 'ResponseTask',
      targetId: task._id,
      details: `Task #${task.taskId} created: "${task.title}" with priority ${task.priority}`,
    });

    broadcastEvent('task:new', { taskId: task.taskId, title: task.title });

    res.status(201).json({
      success: true,
      message: 'Response task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all response tasks with filters & pagination
// @route   GET /api/v1/tasks
// @access  Private (Admin / Volunteer)
const getAllTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { locationName: { $regex: search, $options: 'i' } },
        { taskId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await ResponseTask.countDocuments(query);
    const tasks = await ResponseTask.find(query)
      .populate('disasterReport', 'reportId title category severity')
      .populate('helpRequest', 'requestId requestType priority')
      .populate('assignedVolunteers', 'name email phone')
      .populate('createdBy', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available open tasks for volunteers
// @route   GET /api/v1/tasks/available
// @access  Private (Volunteer)
const getAvailableTasks = async (req, res, next) => {
  try {
    // Open tasks or tasks where volunteer can join
    const tasks = await ResponseTask.find({
      status: { $in: ['open', 'assigned'] },
      assignedVolunteers: { $ne: req.user._id },
    })
      .populate('disasterReport', 'reportId title category severity locationName')
      .populate('helpRequest', 'requestId requestType priority affectedPeople')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to logged-in volunteer
// @route   GET /api/v1/tasks/my-tasks
// @access  Private (Volunteer)
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await ResponseTask.find({
      assignedVolunteers: req.user._id,
    })
      .populate('disasterReport', 'reportId title category severity locationName')
      .populate('helpRequest', 'requestId requestType priority affectedPeople contactPhone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await ResponseTask.findById(req.params.id)
      .populate('disasterReport')
      .populate('helpRequest')
      .populate('assignedVolunteers', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('statusHistory.changedBy', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Response task not found' });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign or reassign volunteers to a task
// @route   PATCH /api/v1/tasks/:id/assign
// @access  Private (Admin)
const assignVolunteers = async (req, res, next) => {
  try {
    const { volunteerIds } = req.body;

    const task = await ResponseTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.assignedVolunteers = volunteerIds;
    if (task.status === 'open' && volunteerIds.length > 0) {
      task.status = 'assigned';
    }

    task.statusHistory.push({
      status: task.status,
      changedBy: req.user._id,
      timestamp: new Date(),
      note: `Assigned ${volunteerIds.length} volunteer(s)`,
    });

    await task.save();

    // Send notifications to newly assigned volunteers
    for (const vId of volunteerIds) {
      const notif = await Notification.create({
        recipient: vId,
        title: `Task Assignment: ${task.title}`,
        message: `You have been assigned to task #${task.taskId} (${task.title}) at ${task.locationName}.`,
        type: 'task',
        link: '/volunteer/my-tasks',
      });
      notifyUser(vId.toString(), notif);
    }

    await logAction({
      req,
      action: 'TASK_ASSIGNED',
      targetModel: 'ResponseTask',
      targetId: task._id,
      details: `Task #${task.taskId} assigned to ${volunteerIds.length} volunteer(s)`,
    });

    res.status(200).json({
      success: true,
      message: 'Volunteers assigned successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept task by volunteer
// @route   PATCH /api/v1/tasks/:id/accept
// @access  Private (Volunteer)
const acceptTask = async (req, res, next) => {
  try {
    const task = await ResponseTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // If task was open, add volunteer
    const isAssigned = task.assignedVolunteers.some((id) => id.toString() === req.user.id);
    if (!isAssigned) {
      task.assignedVolunteers.push(req.user._id);
    }

    task.status = 'accepted';
    task.statusHistory.push({
      status: 'accepted',
      changedBy: req.user._id,
      timestamp: new Date(),
      note: `Accepted by volunteer ${req.user.name}`,
    });

    await task.save();

    await logAction({
      req,
      action: 'TASK_ACCEPTED',
      targetModel: 'ResponseTask',
      targetId: task._id,
      details: `Volunteer ${req.user.name} accepted task #${task.taskId}`,
    });

    broadcastEvent('task:updated', { id: task._id, status: 'accepted' });

    res.status(200).json({
      success: true,
      message: 'You have accepted the response task.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (e.g. in_progress, completed, cancelled)
// @route   PATCH /api/v1/tasks/:id/status
// @access  Private (Volunteer / Admin)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, note, completionNotes } = req.body;

    const task = await ResponseTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Role check: volunteer can only update tasks assigned to them
    if (req.user.role === 'volunteer') {
      const isAssigned = task.assignedVolunteers.some((id) => id.toString() === req.user.id);
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this task.' });
      }
    }

    task.status = status;
    if (completionNotes) task.completionNotes = completionNotes;
    if (status === 'completed') {
      task.completedAt = new Date();

      // If linked to help request, update status to fulfilled
      if (task.helpRequest) {
        await HelpRequest.findByIdAndUpdate(task.helpRequest, { status: 'fulfilled' });
      }
      // If linked to disaster report, check if other active tasks remain
      if (task.disasterReport) {
        const otherActive = await ResponseTask.countDocuments({
          disasterReport: task.disasterReport,
          _id: { $ne: task._id },
          status: { $nin: ['completed', 'cancelled'] },
        });
        if (otherActive === 0) {
          await DisasterReport.findByIdAndUpdate(task.disasterReport, { responseStatus: 'resolved' });
        }
      }

      // Increment volunteer completed count
      for (const volId of task.assignedVolunteers) {
        await VolunteerProfile.findOneAndUpdate({ user: volId }, { $inc: { completedTasksCount: 1 } });
      }
    }

    task.statusHistory.push({
      status,
      changedBy: req.user._id,
      timestamp: new Date(),
      note: note || completionNotes || `Status updated to ${status}`,
    });

    await task.save();

    await logAction({
      req,
      action: 'TASK_STATUS_UPDATED',
      targetModel: 'ResponseTask',
      targetId: task._id,
      details: `Task #${task.taskId} status updated to ${status} by ${req.user.name}`,
    });

    broadcastEvent('task:updated', { id: task._id, status });

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getAvailableTasks,
  getMyTasks,
  getTaskById,
  assignVolunteers,
  acceptTask,
  updateTaskStatus,
};
