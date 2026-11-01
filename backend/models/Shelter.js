const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
  {
    shelterId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Shelter address is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.209, 28.6139],
      },
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy cannot be negative'],
      validate: {
        validator: function (val) {
          return val <= this.totalCapacity;
        },
        message: 'Current occupancy cannot exceed total capacity',
      },
    },
    facilities: {
      type: [String],
      default: ['Food', 'Drinking Water', 'Sleeping Arrangements'],
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
    },
    contactEmail: {
      type: String,
      default: '',
    },
    operationalStatus: {
      type: String,
      enum: ['active', 'full', 'closed', 'maintenance'],
      default: 'active',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

shelterSchema.index({ location: '2dsphere' });

shelterSchema.pre('save', async function (next) {
  if (!this.shelterId) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.shelterId = `SHL-${Date.now().toString().slice(-4)}${randomHex}`;
  }
  // Auto update status if full
  if (this.currentOccupancy >= this.totalCapacity && this.operationalStatus === 'active') {
    this.operationalStatus = 'full';
  } else if (this.currentOccupancy < this.totalCapacity && this.operationalStatus === 'full') {
    this.operationalStatus = 'active';
  }
  next();
});

module.exports = mongoose.model('Shelter', shelterSchema);
