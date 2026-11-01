const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true,
    },
    requestType: {
      type: String,
      required: [true, 'Request type is required'],
      enum: ['rescue', 'medical', 'food', 'water', 'shelter', 'medicine', 'other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    locationName: {
      type: String,
      required: [true, 'Location is required'],
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
    affectedPeople: {
      type: Number,
      required: [true, 'Number of affected people is required'],
      min: 1,
      default: 1,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    assignedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResponseTask',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

helpRequestSchema.index({ location: '2dsphere' });
helpRequestSchema.index({ requestType: 1, priority: 1, status: 1 });

helpRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.requestId = `REQ-${year}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
