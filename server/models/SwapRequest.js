const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requesterName: {
    type: String,
  },
  offeredSkill: {
    type: String,
    default: 'Web Development',
  },
  wantedSkill: {
    type: String,
    default: 'Design',
  },
  note: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Accepted', 'Declined', 'Completed'],
    default: 'Pending Review',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
