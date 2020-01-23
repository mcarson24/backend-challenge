const Snapshot = require('../app/models/snapshot');
const SnapshotNotFoundError = require("../SnapshotNotFoundError");
const InvalidDateError = require("../InvalidDateError");
const moment = require('moment');
const Time = require('../app/Time');

module.exports.index = async (req, res, next) => {
  if (queryParametersExistOnRequest(req, 'at')) {
    const date = new Time(`${req.query.at}+00:00`).string();
    const snapshot = await Snapshot.findOneAfter(date);

    if (!snapshot) return next(new SnapshotNotFoundError(date.formatted));

    return res.json({
      at: moment(snapshot.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss"),
      stations: JSON.parse(snapshot.stations),
      weather: JSON.parse(snapshot.weather)
    });
  }

  latest = await Snapshot.latest();

  if (!latest) return next(new SnapshotNotFoundError);
  
  res.json({
    at: moment(latest.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss"),
    stations: JSON.parse(latest.stations),
    weather: JSON.parse(latest.weather)
  });
}

module.exports.getStationSnapshot = async (req, res, next) => {
  if (!queryParametersExistOnRequest(req, 'from', 'to')) { 
    if (!queryParametersExistOnRequest(req, 'at')) {
      return next({
        status: 400,
        message: `The request was incorrectly formed. The 'at' parameter was missing.`
      });
    }

    // Return snapshot from specific point in time
    const date = new Time(`${req.query.at}+00:00`).string();
    if (datesAreInvalid(date)) return next(InvalidDateError);

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

  if (datesAreInvalid(from, to)) return next(new InvalidDateError);

  let snapshotsCollection = await Snapshot.between(from, to);

  snapshotsCollection.onlyGetStaionDataFor(req.params.id)

  if (req.query.frequency === 'daily') snapshotsCollection.onlyGetDailySnapshots();

  res.json(snapshotsCollection.json);
}

const queryParametersExistOnRequest = (req, ...params) => {
  const paramsExist = params.map(param => {
    return !!req.query[param];
  });

  return !paramsExist.includes(false);
}

const datesAreInvalid = (...dates) => {
  const valid = dates.map(date => {
    return date !== 'Invalid date';
  });
  
  return valid.includes(false);
}
