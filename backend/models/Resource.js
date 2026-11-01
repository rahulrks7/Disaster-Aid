const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'food_packages',
        'drinking_water',
        'medical_supplies',
        'blankets',
        'clothing',
        'rescue_equipment',
        'other',
      ],
      index: true,
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required (e.g. boxes, liters, kits, units)'],
      trim: true,
      default: 'units',
    },
    storageLocation: {
      type: String,
      required: [true, 'Storage location is required'],
      trim: true,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: 0,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.pre('save', async function (next) {
  if (!this.resourceId) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.resourceId = `RES-${Date.now().toString().slice(-4)}${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('Resource', resourceSchema);
