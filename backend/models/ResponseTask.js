const mongoose = require('mongoose');

const responseTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    disasterReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisasterReport',
    },
    helpRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    locationName: {
      type: String,
      required: [true, 'Location is required'],
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
    status: {
      type: String,
      enum: ['open', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completionNotes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

responseTaskSchema.index({ location: '2dsphere' });
responseTaskSchema.index({ status: 1, priority: 1 });

responseTaskSchema.pre('save', async function (next) {
  if (!this.taskId) {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.taskId = `TSK-${year}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('ResponseTask', responseTaskSchema);
