const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: ['First Aid', 'Food Distribution'],
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    generalLocation: {
      type: String,
      required: [true, 'General service location is required'],
      trim: true,
    },
    locationCoordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.209, 28.6139],
    },
    availability: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
      index: true,
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
    },
    activeTasksCount: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

volunteerProfileSchema.index({ availability: 1, status: 1 });

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
