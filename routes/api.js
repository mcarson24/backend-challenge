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
    data = {
      at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
      stations: JSON.parse(snapshot.station),
      weather: JSON.parse(snapshot.weather)
    };
  } else {
    data = await Snapshot.find({});
  }
  res.json(data);
  res.end();
});

module.exports = router;
