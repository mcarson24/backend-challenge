const Snapshot = require('../app/models/snapshot');
const SnapshotNotFoundError = require("../SnapshotNotFoundError");
const moment = require('moment');
const Time = require('../app/Time');

module.exports.index = async (req, res, next) => {
  let data;

  if (req.query.at) {
    const date = new Time(`${req.query.at}+00:00`);
    const snapshot = await Snapshot.findOneAfter(date.toString);

    if (!snapshot) {
      next(new SnapshotNotFoundError(date.formatted));
    } else {
      data = {
        at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        stations: JSON.parse(snapshot.stations),
        weather: JSON.parse(snapshot.weather)
      };
    }
  } else {
    snapshot = await Snapshot.latest();
    if (!snapshot) {
      // No snapshots found
      next(new SnapshotNotFoundError());
    } else {
      data = {
        at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        stations: JSON.parse(snapshot.stations),
        weather: JSON.parse(snapshot.weather)
      };
    }
  }
  res.json(data);
}

module.exports.getStationSnapshot = async (req, res) => {
  if (!req.query.from && !req.query.to) {
    const date = new Date(`${req.query.at}+00:00`);
    const dateQuery = date.toString().trim();
    const snapshot = await Snapshot.findOne({ createdAt: { $lte: dateQuery } });
    const stations = JSON.parse(snapshot.stations);
    const desiredStationData = stations.filter(station => {
      return station.properties.kioskId == req.params.id;
    });
    res.json({
      at: snapshot.createdAt,
      station: desiredStationData[0],
      weather: JSON.parse(snapshot.weather)
    });
  } else {
    const to = new Date(`${req.query.to}+00:00`).toString().trim();
    const from = new Date(`${req.query.from}+00:00`).toString().trim();
    let snapshots = await Snapshot.find({
      createdAt: { $lte: to, $gte: from }
    });
    snapshots = snapshots.map(snapshot => {
      snapshot.stations = JSON.stringify(
        JSON.parse(snapshot.stations).filter(station => {
          if (station.properties.kioskId == req.params.id) {
            return station;
          }
        })
      );
      return snapshot;
    });
    let data = [];
    snapshots.forEach(snapshot => {
      data.push({
        at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        station: JSON.parse(snapshot.stations)[0],
        weather: JSON.parse(snapshot.weather)
      });
    });
    res.json(data);
  }
}
