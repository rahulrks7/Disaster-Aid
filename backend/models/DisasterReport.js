const mongoose = require('mongoose');

const disasterReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, 'Disaster category is required'],
      enum: [
        'flood',
        'fire',
        'earthquake',
        'cyclone',
        'landslide',
        'road_accident',
        'building_collapse',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
    },
    severity: {
      type: String,
      required: [true, 'Severity level is required'],
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    locationName: {
      type: String,
      required: [true, 'Location address or name is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139], // Default fallback
      },
    },
    affectedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    responseStatus: {
      type: String,
      enum: ['reported', 'response_in_progress', 'resolved'],
      default: 'reported',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index for location queries
disasterReportSchema.index({ location: '2dsphere' });
disasterReportSchema.index({ category: 1, severity: 1, verificationStatus: 1 });

// Generate sequential readable reportId pre-save
disasterReportSchema.pre('save', async function (next) {
  if (!this.reportId) {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    this.reportId = `RPT-${year}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('DisasterReport', disasterReportSchema);
