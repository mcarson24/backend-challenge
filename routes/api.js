const express   = require('express');
const router    = express();
const Snapshot  = require('../models/snapshot');
const moment    = require('moment');

router.get("/stations", async (req, res) => {
  let data;

  if (req.query.at) {
    const date = new Date(`${req.query.at}+00:00`);
    const dateQuery = date.toString().trim();
    const snapshot = await Snapshot.findOne({ createdAt: { $gte: dateQuery } });
    if (!snapshot) {
      res.status(404)
      data = {
        error: {
          message: "Could not find data for that time.",
          status: 404
        }
      }
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
    snapshot = await Snapshot.findOne({}).sort({ createdAt: 'desc' });
    if (!snapshot) { // No snapshots found
      res.status(404);
      data = {
        error: {
          message: 'Could not find snapshot data for that time',
          status: 404
        }
      };
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
  res.json(data)
     .end();
});


router.get("/stations/:id", async (req, res) => {
  if (!req.query.from && !req.query.to) {
    const date = new Date(`${req.query.at}+00:00`);
    const dateQuery = date.toString().trim();
    const snapshot = await Snapshot.findOne({ createdAt: { $lte: dateQuery } });
    const stations = JSON.parse(snapshot.stations);
    const desiredStationData = stations.filter(station => {
      return station.properties.kioskId == req.params.id
    });
    res.json({
      at: snapshot.createdAt,
      station: desiredStationData[0],
      weather: JSON.parse(snapshot.weather),
    });
  } else {
    const to = new Date(`${req.query.to}+00:00`).toString().trim();
    const from = new Date(`${req.query.from}+00:00`).toString().trim();
    let snapshots = await Snapshot.find({ createdAt: { $lte: to, $gte: from } });
    snapshots = snapshots.map(snapshot => {
      snapshot.stations = JSON.stringify(
        JSON.parse(snapshot.stations).filter(station => {
          if (station.properties.kioskId == req.params.id) {
            return station;
          };
        })
      );
      return snapshot;
    });
    let data  = [];
    snapshots.forEach(snapshot => {
      data.push({
        at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        station: JSON.parse(snapshot.stations)[0],
        weather: JSON.parse(snapshot.weather)
      });
    })
    res.json(data);
  }
});

module.exports = router;
