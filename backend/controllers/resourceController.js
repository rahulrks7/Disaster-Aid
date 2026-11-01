const Resource = require('../models/Resource');
const ResourceTransaction = require('../models/ResourceTransaction');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all resources with low stock filtering & search
// @route   GET /api/v1/resources
// @access  Private (Admin / All authenticated)
const getAllResources = async (req, res, next) => {
  try {
    const { category, storageLocation, lowStockOnly, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (storageLocation) query.storageLocation = { $regex: storageLocation, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
        { storageLocation: { $regex: search, $options: 'i' } },
      ];
    }

    let resources = await Resource.find(query).sort({ name: 1 });

    if (lowStockOnly === 'true') {
      resources = resources.filter((r) => r.availableQuantity <= r.minStockLevel);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = resources.length;
    const paginated = resources.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Identify total low stock items count
    const lowStockCount = (await Resource.find()).filter(
      (r) => r.availableQuantity <= r.minStockLevel
    ).length;

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      lowStockCount,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new relief resource
// @route   POST /api/v1/resources
// @access  Private (Admin)
const createResource = async (req, res, next) => {
  try {
    const { name, category, availableQuantity, unit, storageLocation, minStockLevel } = req.body;

    const resource = await Resource.create({
      name,
      category,
      availableQuantity: Number(availableQuantity) || 0,
      unit: unit || 'units',
      storageLocation,
      minStockLevel: Number(minStockLevel) || 10,
    });

    if (Number(availableQuantity) > 0) {
      await ResourceTransaction.create({
        resource: resource._id,
        transactionType: 'addition',
        quantity: Number(availableQuantity),
        reason: 'Initial stock intake',
        destination: storageLocation,
        admin: req.user._id,
        balanceAfter: Number(availableQuantity),
      });
    }

    await logAction({
      req,
      action: 'RESOURCE_CREATED',
      targetModel: 'Resource',
      targetId: resource._id,
      details: `Resource "${resource.name}" created with ${resource.availableQuantity} ${resource.unit}`,
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource details
// @route   PATCH /api/v1/resources/:id
// @access  Private (Admin)
const updateResource = async (req, res, next) => {
  try {
    const { name, category, unit, storageLocation, minStockLevel } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (name) resource.name = name;
    if (category) resource.category = category;
    if (unit) resource.unit = unit;
    if (storageLocation) resource.storageLocation = storageLocation;
    if (minStockLevel !== undefined) resource.minStockLevel = Number(minStockLevel);

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record inventory transaction (Addition or Distribution)
// @route   POST /api/v1/resources/:id/transactions
// @access  Private (Admin)
const recordTransaction = async (req, res, next) => {
  try {
    const { transactionType, quantity, reason, destination } = req.body;
    const qty = Number(quantity);

    if (!['addition', 'distribution'].includes(transactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction type' });
    }

    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (transactionType === 'distribution' && resource.availableQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Requested: ${qty} ${resource.unit}, Available: ${resource.availableQuantity} ${resource.unit}`,
      });
    }

    if (transactionType === 'addition') {
      resource.availableQuantity += qty;
    } else {
      resource.availableQuantity -= qty;
    }

    await resource.save();

    const transaction = await ResourceTransaction.create({
      resource: resource._id,
      transactionType,
      quantity: qty,
      reason: reason || (transactionType === 'addition' ? 'Restock' : 'Emergency Distribution'),
      destination: destination || (transactionType === 'addition' ? resource.storageLocation : 'Affected Area'),
      admin: req.user._id,
      balanceAfter: resource.availableQuantity,
    });

    await logAction({
      req,
      action: `RESOURCE_${transactionType.toUpperCase()}`,
      targetModel: 'Resource',
      targetId: resource._id,
      details: `${transactionType === 'addition' ? 'Added' : 'Distributed'} ${qty} ${resource.unit} of "${resource.name}". Remaining: ${resource.availableQuantity}`,
    });

    res.status(200).json({
      success: true,
      message: `Stock ${transactionType} recorded successfully`,
      data: {
        resource,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction logs for a resource
// @route   GET /api/v1/resources/:id/transactions
// @access  Private (Admin)
const getResourceTransactions = async (req, res, next) => {
  try {
    const transactions = await ResourceTransaction.find({ resource: req.params.id })
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  createResource,
  updateResource,
  recordTransaction,
  getResourceTransactions,
};
