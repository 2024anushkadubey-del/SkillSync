const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'request_received',
      'request_sent',
      'swap_completed',
      'rating_received',
      'security_audit',
      'role_assigned',
      'admin_moderation',
    ],
    default: 'request_sent',
  },
  title: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    default: '',
  },
  timestamp: {
    type: String,
    default: 'Just now',
  },
  status: {
    type: String,
    default: 'Active',
  },
  partner: {
    type: String,
    default: 'Campus Member',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Protected activity flag (only visible to HR, auditor, and admin)
  isRestricted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Activity', activitySchema);
