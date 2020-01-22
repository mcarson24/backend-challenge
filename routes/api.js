<<<<<<< HEAD
const express       = require('express');
const router        = express();
const Snapshot      = require('../models/snapshot');
const moment        = require('moment');

router.get("/stations", async (req, res) => {
  let data;

  if (req.query.at) {
    const date = new Date(`${req.query.at}+00:00`).toString().trim();
    const snapshot = await Snapshot.findOneAfter(date);

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
          . format("YYYY-MM-DD:THH:mm:ss"),
        stations: JSON.parse(snapshot.stations),
        weather: JSON.parse(snapshot.weather)
      };
    }
  }
  res.json(data)
     .end();
});
=======
const express   = require('express');
const router    = express();
const snapshots_controller = require('../controllers/snapshotsController');

router.get('/stations', snapshots_controller.index);
router.get('/stations/:id', snapshots_controller.getStationSnapshot)
>>>>>>> messing-with-mongoose

module.exports = router;
