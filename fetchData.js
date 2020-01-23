const Snapshot  = require('./app/models/snapshot');
const fetch     = require('node-fetch');

const fetchData = async () => {
  let data = {
    createdAt: new Date()
  };
  await fetch("https://www.rideindego.com/stations/json/")
    .then(response => response.json())
    .then(stations => {
      data.stations = JSON.stringify(stations.features);
    });
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Philadelphia,PA,US&units=imperial&appid=${process.env.OPENWEATHERMAP_KEY}`
  )
    .then(response => response.json())
    .then(weather => {
      data.weather = JSON.stringify(weather);
    });
  await Snapshot.create(data);
  console.log(`Saved a snapshot at ${new Date()}`);
}

module.exports = fetchData;
