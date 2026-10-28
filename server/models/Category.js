const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'BookOpen',
  },
  count: {
    type: String,
    default: '50+ Students',
  },
  color: {
    type: String,
    default: 'from-forest-800 to-forest-950',
  },
  description: {
    type: String,
    default: '',
  },
  popularTopics: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
