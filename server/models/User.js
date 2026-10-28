const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/rbac');

const skillOfferedSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: String, default: 'Intermediate' },
  category: { type: String, default: 'Development' },
  description: { type: String, default: '' },
}, { _id: false });

const skillWantedSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  targetLevel: { type: String, default: 'Beginner' },
  category: { type: String, default: 'Design' },
  description: { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STAFF,
  },
  major: {
    type: String,
    default: 'Computer Science Major',
  },
  university: {
    type: String,
    default: 'State Tech University',
  },
  avatar: {
    type: String,
    default: 'ST',
  },
  completedSwaps: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  availability: {
    type: String,
    default: 'Weekdays & Weekends',
  },
  bio: {
    type: String,
    default: 'SkillSync active student peer learner.',
  },
  skillsOffered: [skillOfferedSchema],
  skillsWanted: [skillWantedSchema],
  teaches: [String],
  wantsToLearn: [String],
  matchPercentage: {
    type: Number,
    default: 85,
  },
  // PROTECTED SENSITIVE DATA (Experiment 4 Part 8):
  // Restricted fields hidden from public view, only visible to HR and Admin
  internalModerationNotes: {
    type: String,
    default: 'Student account verified by campus administration.',
    select: false, // Omitted by default in standard queries
  },
  securityStatus: {
    type: String,
    enum: ['Verified', 'Good Standing', 'Audited', 'Restricted'],
    default: 'Verified',
  },
}, {
  timestamps: true,
});

// Pre-save hook: Hash password securely if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe public projection (never exposes password or private moderation notes)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    major: this.major,
    university: this.university,
    avatar: this.avatar,
    completedSwaps: this.completedSwaps,
    rating: this.rating,
    availability: this.availability,
    bio: this.bio,
    skillsOffered: this.skillsOffered,
    skillsWanted: this.skillsWanted,
    teaches: this.teaches && this.teaches.length > 0 ? this.teaches : this.skillsOffered.map(s => s.name),
    wantsToLearn: this.wantsToLearn && this.wantsToLearn.length > 0 ? this.wantsToLearn : this.skillsWanted.map(s => s.name),
    matchPercentage: this.matchPercentage,
    securityStatus: this.securityStatus,
  };
};

// Admin view (includes moderation details)
userSchema.methods.toAdminObject = function () {
  return {
    ...this.toSafeObject(),
    internalModerationNotes: this.internalModerationNotes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
