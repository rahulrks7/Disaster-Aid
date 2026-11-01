const mongoose = require('mongoose');

const resourceTransactionSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['addition', 'distribution'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      default: 'Main Warehouse / General Distribution',
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resourceTransactionSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model('ResourceTransaction', resourceTransactionSchema);
