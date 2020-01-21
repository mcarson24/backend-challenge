const mongoose = require('mongoose');
const moment   = require('moment');

const SnapshotSchema = new mongoose.Schema({
  stations: String,
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

const Snapshot = mongoose.model('snapshot', SnapshotSchema);

Snapshot.findOneAfter = async date => {
  return await Snapshot.findOne({ createdAt: { $gte: date } });
}

module.exports = Snapshot;
