const Snapshot = require('../app/models/snapshot');
const SnapshotNotFoundError = require("../SnapshotNotFoundError");
const InvalidDateError = require("../InvalidDateError");
const moment = require('moment');
const Time = require('../app/Time');
const { DateTime } = require('luxon');

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
    let date = new Time(`${req.query.at}+00:00`).string();
    if (date == 'Invalid date') return next(new InvalidDateError);
    const snapshot = await Snapshot.findOne({ createdAt: { $gte: date } });

    if (!snapshot) return next(SnapshotNotFoundError);

    const desiredStationData = JSON.parse(snapshot.stations).filter(station => {
      return station.properties.kioskId == req.params.id;
    });

    return res.json({
      at: snapshot.createdAt,
      station: desiredStationData[0],
      weather: JSON.parse(snapshot.weather)
    });
  } 

  // Return snapshots in a range of times.
  const to = new Time(`${req.query.to}+00:00`).string();
  const from = new Time(`${req.query.from}+00:00`).string();
  if (to == 'Invalid date' || from == 'Invalid date') return next(new InvalidDateError);
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
  if (req.query.frequency === 'daily') {
    let dates = [];
    data = data.filter(snapshot => {
      const date = snapshot.at.substring(0, 10);
      const time = snapshot.at.substring(12);
      // 17:00:00 UTC is noon Eastern Time (Except for a three week period in March and a week in October-November)
      // But I can live with that for this project.
      if (!dates.includes(date) &&time >= "17:00:00") {
        dates.push(date);
        return snapshot;
      }
    });
  }
  res.json(data);
}
