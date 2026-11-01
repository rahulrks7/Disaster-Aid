const VolunteerProfile = require('../models/VolunteerProfile');
const User = require('../models/User');
const ResponseTask = require('../models/ResponseTask');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all volunteers with filters & pagination
// @route   GET /api/v1/volunteers
// @access  Private (Admin)
const getAllVolunteers = async (req, res, next) => {
  try {
    const {
      skill,
      availability,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (availability) query.availability = availability;
    if (status) query.status = status;
    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    if (search) {
      query.$or = [
        { generalLocation: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await VolunteerProfile.countDocuments(query);
    const volunteers = await VolunteerProfile.find(query)
      .populate('user', 'name email phone avatar createdAt isActive')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: volunteers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: volunteers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current volunteer's profile
// @route   GET /api/v1/volunteers/me
// @access  Private (Volunteer)
const getMyVolunteerProfile = async (req, res, next) => {
  try {
    let profile = await VolunteerProfile.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');

    if (!profile) {
      // Create if missing
      profile = await VolunteerProfile.create({
        user: req.user._id,
        skills: ['First Aid', 'Food Distribution'],
        generalLocation: req.user.address || 'Service Area',
        availability: 'available',
      });
      profile = await profile.populate('user', 'name email phone avatar');
    }

    // Get active tasks count and completed tasks count
    const completedTasks = await ResponseTask.countDocuments({
      assignedVolunteers: req.user._id,
      status: 'completed',
    });
    const activeTasks = await ResponseTask.countDocuments({
      assignedVolunteers: req.user._id,
      status: { $in: ['assigned', 'accepted', 'in_progress'] },
    });

    profile.completedTasksCount = completedTasks;
    profile.activeTasksCount = activeTasks;
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current volunteer's profile
// @route   PATCH /api/v1/volunteers/me
// @access  Private (Volunteer)
const updateMyVolunteerProfile = async (req, res, next) => {
  try {
    const { skills, experienceYears, generalLocation, availability, bio, emergencyContact, latitude, longitude } = req.body;

    let profile = await VolunteerProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new VolunteerProfile({ user: req.user._id });
    }

    if (skills) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (generalLocation) profile.generalLocation = generalLocation;
    if (availability && ['available', 'unavailable'].includes(availability)) profile.availability = availability;
    if (bio !== undefined) profile.bio = bio;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;

    if (latitude && longitude) {
      profile.locationCoordinates = [parseFloat(longitude), parseFloat(latitude)];
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single volunteer by ID
// @route   GET /api/v1/volunteers/:id
// @access  Private (Admin)
const getVolunteerById = async (req, res, next) => {
  try {
    const profile = await VolunteerProfile.findById(req.params.id).populate('user', 'name email phone avatar isActive');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    // Get volunteer tasks
    const tasks = await ResponseTask.find({ assignedVolunteers: profile.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        profile,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update volunteer status / eligibility
// @route   PATCH /api/v1/volunteers/:id/status
// @access  Private (Admin)
const updateVolunteerStatusAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const profile = await VolunteerProfile.findById(req.params.id).populate('user');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    profile.status = status;
    await profile.save();

    await logAction({
      req,
      action: 'VOLUNTEER_STATUS_UPDATED',
      targetModel: 'VolunteerProfile',
      targetId: profile._id,
      details: `Volunteer ${profile.user.name} status updated to ${status} by Admin`,
    });

    res.status(200).json({
      success: true,
      message: `Volunteer status set to ${status}`,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVolunteers,
  getMyVolunteerProfile,
  updateMyVolunteerProfile,
  getVolunteerById,
  updateVolunteerStatusAdmin,
};
