const Time                  = require('../app/Time');
// const Snapshot              = require('../app/models/snapshot');
const InvalidDateError      = require("./errors/InvalidDateError");
const SnapshotCollection    = require('../app/SnapshotCollection');
const SnapshotNotFoundError = require("./errors/SnapshotNotFoundError");

module.exports.index = async (req, res, next) => {
  if (queryParametersExistOnRequest(req, 'at')) {
    const date = new Time(`${req.query.at}+00:00`).string();
    const snapshot = await Snapshot.findOneAfter(date);
    
    if (snapshot.empty()) return next(new SnapshotNotFoundError(date.formatted));

    return res.json(snapshot.json);
  }
  // If a specific time is not specified, 
  // get the most recent snapshot.
  latest = await Snapshot.latest();

  if (latest.empty()) return next(new SnapshotNotFoundError);
  
  res.json(latest.json);
}

module.exports.getStationSnapshot = async (req, res, next) => {
  if (!queryParametersExistOnRequest(req, 'from', 'to')) { 
    if (!queryParametersExistOnRequest(req, 'at')) {
      return next({
        status: 400,
        message: `The request was incorrectly formed. The 'at' parameter was missing.`
      });
    }
    // Return snapshot from specific point in time.
    const date = new Time(`${req.query.at}+00:00`).string();

    if (datesAreInvalid(date)) return next(new InvalidDateError);

    const snapshot = await Snapshot.findOneAfter(date);

    if (!snapshot) return next(SnapshotNotFoundError);

    snapshot.onlyGetStationDataFor(req.params.id);
    return res.json(snapshot.onlyGetStationDataFor(req.params.id).json);
    // return res.json(snapshot.json);
  } 

  // Return snapshots in a range of times.
  const to    = new Time(`${req.query.to}+00:00`).string();
  const from  = new Time(`${req.query.from}+00:00`).string();
  if (datesAreInvalid(from, to)) return next(new InvalidDateError);

  // const snapshotsCollection = await Snapshot.between(from, to);
  snapshots = new SnapshotCollection;
  await snapshots.between(from, to);
  await snapshots.onlyGetStationDataFor(req.params.id);
  // snapshotsCollection.onlyGetStaionDataFor(req.params.id);
  if (req.query.frequency === 'daily') snapshots.onlyGetDailySnapshots();

  res.json(snapshots.json);
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
