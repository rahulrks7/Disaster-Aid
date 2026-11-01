const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Alert description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'flood',
        'fire',
        'earthquake',
        'cyclone',
        'landslide',
        'road_accident',
        'building_collapse',
        'weather_warning',
        'general_emergency',
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
    },
    affectedArea: {
      type: String,
      required: [true, 'Affected area name is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [77.209, 28.6139],
      },
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ location: '2dsphere' });
alertSchema.index({ isActive: 1, expiryTime: 1 });

alertSchema.pre('save', async function (next) {
  if (!this.alertId) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.alertId = `ALT-${Date.now().toString().slice(-4)}${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('Alert', alertSchema);
