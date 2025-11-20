const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  theme: {
    type: String,
    default: 'default',
    enum: ['default', 'light', 'dark', 'colorful', 'minimal', 'vintage']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drawingData: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
canvasSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Canvas', canvasSchema);
