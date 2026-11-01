const Shelter = require('../models/Shelter');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all shelters (Admin & Public)
// @route   GET /api/v1/shelters
// @access  Public / Private
const getAllShelters = async (req, res, next) => {
  try {
    const { operationalStatus, search, availableOnly, page = 1, limit = 20 } = req.query;
    const query = {};

    if (operationalStatus) query.operationalStatus = operationalStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { shelterId: { $regex: search, $options: 'i' } },
      ];
    }

    let shelters = await Shelter.find(query).sort({ operationalStatus: 1, name: 1 });

    if (availableOnly === 'true') {
      shelters = shelters.filter((s) => s.currentOccupancy < s.totalCapacity && s.operationalStatus === 'active');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = shelters.length;
    const paginated = shelters.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Calculate aggregated capacity numbers
    const all = await Shelter.find();
    const totalCapacity = all.reduce((sum, s) => sum + s.totalCapacity, 0);
    const totalOccupancy = all.reduce((sum, s) => sum + s.currentOccupancy, 0);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      stats: {
        totalShelters: all.length,
        totalCapacity,
        totalOccupancy,
        availableSlots: Math.max(0, totalCapacity - totalOccupancy),
      },
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shelter by ID
// @route   GET /api/v1/shelters/:id
// @access  Public
const getShelterById = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    res.status(200).json({
      success: true,
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new shelter
// @route   POST /api/v1/shelters
// @access  Private (Admin)
const createShelter = async (req, res, next) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      totalCapacity,
      currentOccupancy,
      facilities,
      contactPhone,
      contactEmail,
      operationalStatus,
      notes,
    } = req.body;

    const lng = parseFloat(longitude) || 77.209;
    const lat = parseFloat(latitude) || 28.6139;

    const cap = Number(totalCapacity) || 50;
    const occ = Number(currentOccupancy) || 0;

    if (occ > cap) {
      return res.status(400).json({
        success: false,
        message: 'Current occupancy cannot exceed total capacity',
      });
    }

    const shelter = await Shelter.create({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      totalCapacity: cap,
      currentOccupancy: occ,
      facilities: Array.isArray(facilities)
        ? facilities
        : typeof facilities === 'string'
        ? facilities.split(',').map((f) => f.trim())
        : ['Food', 'Drinking Water', 'Sleeping Arrangements'],
      contactPhone,
      contactEmail: contactEmail || '',
      operationalStatus: operationalStatus || (occ >= cap ? 'full' : 'active'),
      notes: notes || '',
    });

    await logAction({
      req,
      action: 'SHELTER_CREATED',
      targetModel: 'Shelter',
      targetId: shelter._id,
      details: `Shelter "${shelter.name}" created with capacity ${shelter.totalCapacity}`,
    });

    res.status(201).json({
      success: true,
      message: 'Relief shelter created successfully',
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shelter info & occupancy
// @route   PATCH /api/v1/shelters/:id
// @access  Private (Admin)
const updateShelter = async (req, res, next) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      totalCapacity,
      currentOccupancy,
      facilities,
      contactPhone,
      contactEmail,
      operationalStatus,
      notes,
    } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    if (name) shelter.name = name;
    if (address) shelter.address = address;
    if (latitude && longitude) {
      shelter.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (totalCapacity !== undefined) {
      shelter.totalCapacity = Number(totalCapacity);
    }

    if (currentOccupancy !== undefined) {
      const occ = Number(currentOccupancy);
      if (occ < 0 || occ > shelter.totalCapacity) {
        return res.status(400).json({
          success: false,
          message: `Occupancy (${occ}) must be between 0 and total capacity (${shelter.totalCapacity})`,
        });
      }
      shelter.currentOccupancy = occ;
    }

    if (facilities) {
      shelter.facilities = Array.isArray(facilities)
        ? facilities
        : facilities.split(',').map((f) => f.trim());
    }

    if (contactPhone) shelter.contactPhone = contactPhone;
    if (contactEmail !== undefined) shelter.contactEmail = contactEmail;
    if (operationalStatus) shelter.operationalStatus = operationalStatus;
    if (notes !== undefined) shelter.notes = notes;

    await shelter.save();

    await logAction({
      req,
      action: 'SHELTER_UPDATED',
      targetModel: 'Shelter',
      targetId: shelter._id,
      details: `Shelter "${shelter.name}" updated (Occupancy: ${shelter.currentOccupancy}/${shelter.totalCapacity})`,
    });

    res.status(200).json({
      success: true,
      message: 'Shelter updated successfully',
      data: shelter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shelter
// @route   DELETE /api/v1/shelters/:id
// @access  Private (Admin)
const deleteShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    await logAction({
      req,
      action: 'SHELTER_DELETED',
      targetModel: 'Shelter',
      targetId: shelter._id,
      details: `Shelter "${shelter.name}" removed`,
    });

    res.status(200).json({
      success: true,
      message: 'Shelter deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
};
