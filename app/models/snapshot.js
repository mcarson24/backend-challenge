const mongoose            = require('mongoose');
const SnapshotCollection  = require('../SnapshotCollection');

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
    this.createdAt = new Date
  }
  next();
})

Snapshot = mongoose.model('snapshot', SnapshotSchema);

Snapshot.findOneAfter = async date => {
  const snapshot = await Snapshot.findOne({ createdAt: { $gte: date } });

  if (snapshot) {
    return new SnapshotCollection([snapshot]);
  }
  return new SnapshotCollection;
}

Snapshot.latest = async () => {
  const snapshot = await Snapshot.findOne({}).sort({ createdAt: -1 });
  if (snapshot) {
    return new SnapshotCollection([snapshot]);
  }
  return new SnapshotCollection;
}

Snapshot.between = async (from, to) => {
  const snapshots = await Snapshot.find({
    createdAt: { $lte: to, $gte: from }
  });

  return new SnapshotCollection(snapshots);
}

module.exports = Snapshot;
