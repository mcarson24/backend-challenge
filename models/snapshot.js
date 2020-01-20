const mongoose = require('mongoose');

const SnapshotSchema = new mongoose.Schema({
  station: String,
  weather: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SnapshotSchema.pre('save', next => {
  if (!this.createdAt) {
    this.createdAt = Date.now()
  }
  next();
})

module.exports = mongoose.model('snapshot', SnapshotSchema);
