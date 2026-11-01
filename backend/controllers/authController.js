const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const { logAction } = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'disasteraid_super_secure_jwt_secret_key_2024_mcak',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new user (Citizen or Volunteer)
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, skills, experienceYears, generalLocation } = req.body;

    // Validate email uniqueness
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Security: never allow registering directly as admin via public endpoint
    const assignedRole = role === 'volunteer' ? 'volunteer' : 'citizen';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      address: address || '',
    });

    // If registering as volunteer, initialize VolunteerProfile
    if (assignedRole === 'volunteer') {
      await VolunteerProfile.create({
        user: user._id,
        skills: Array.isArray(skills) && skills.length > 0 ? skills : ['First Aid', 'Food Distribution'],
        experienceYears: Number(experienceYears) || 0,
        generalLocation: generalLocation || address || 'General Service Area',
        availability: 'available',
        emergencyContact: phone || '',
      });
    }

    const token = generateToken(user._id);

    await logAction({
      user,
      action: 'USER_REGISTERED',
      targetModel: 'User',
      targetId: user._id,
      details: `New ${assignedRole} registered: ${user.name} (${user.email})`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Find user by email, include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact system administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    await logAction({
      user,
      action: 'USER_LOGIN',
      targetModel: 'User',
      targetId: user._id,
      details: `${user.name} logged in (${user.role})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let volunteerProfile = null;

    if (user.role === 'volunteer') {
      volunteerProfile = await VolunteerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        volunteerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
