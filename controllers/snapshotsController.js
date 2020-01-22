const Snapshot = require('../app/models/snapshot');
const SnapshotNotFoundError = require("../SnapshotNotFoundError");
const moment = require('moment');
const Time = require('../app/Time');

module.exports.index = async (req, res, next) => {
  if (req.query.at) {
    const date = new Time(`${req.query.at}+00:00`);
    const snapshot = await Snapshot.findOneAfter(date.string());

    if (!snapshot) return next(new SnapshotNotFoundError(date.formatted));

    return res.json({
      at: moment(snapshot.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss"),
      stations: JSON.parse(snapshot.stations),
      weather: JSON.parse(snapshot.weather)
    });
  }
  latest = await Snapshot.latest();

  if (!latest) return next(new SnapshotNotFoundError());
  
  res.json({
    at: moment(latest.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss"),
    stations: JSON.parse(latest.stations),
    weather: JSON.parse(latest.weather)
  });
}

module.exports.getStationSnapshot = async (req, res, next) => {
  if (!req.query.from && !req.query.to) { 
    if (!req.query.at) {
      return next({
        status: 400,
        message: `The request was incorrectly formed. The 'at' parameter was missing.`
      });
    }
    // Return snapshot from specific point in time
    const date = new Time(`${req.query.at}+00:00`);
    const snapshot = await Snapshot.findOne({ createdAt: { $lte: date.string() } });
    const desiredStationData = JSON.parse(snapshot.stations).filter(station => {
      return station.properties.kioskId == req.params.id;
    });
    return res.json({
      at: snapshot.createdAt,
      station: desiredStationData[0],
      weather: JSON.parse(snapshot.weather)
    });
  } 

  // Return snapshots in a range range of times.
  const to = new Time(`${req.query.to}+00:00`).string();
  const from = new Time(`${req.query.from}+00:00`).string();
  let snapshots = await Snapshot.between(from, to);
  let data = [];

  snapshots.map(snapshot => {
    snapshot.stations = JSON.stringify(
      JSON.parse(snapshot.stations).filter(station => {
        if (station.properties.kioskId == req.params.id) {
          return station;
        }
      }));
    return snapshot;
  }).map(snapshot => {
    data.push({
      at: moment(snapshot.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss"),
      station: JSON.parse(snapshot.stations)[0],
      weather: JSON.parse(snapshot.weather)
    });
  });
  res.json(data);
}
