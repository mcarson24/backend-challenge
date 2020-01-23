const moment = require('moment');

module.exports = class SnapshotCollection {
  constructor(snapshots = []) {
    this.collection = snapshots; 
  }

  get json() {
    if (this.collection.length == 1) {
      return {
        at: moment(this.collection[0].createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        station: JSON.parse(this.collection[0].stations)[0],
        weather: JSON.parse(this.collection[0].weather)
      };
    }
    return this.collection.map(snapshot => {
      return {
        at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        station: JSON.parse(snapshot.stations)[0],
        weather: JSON.parse(snapshot.weather)
      };
    });
  }

  empty() {
    return this.collection.length < 1;
  }

  onlyGetStaionDataFor(kioskId) {
    this.collection.map(snapshot => {
      snapshot.stations = JSON.stringify(
        JSON.parse(snapshot.stations).filter(station => {
          if (station.properties.kioskId == kioskId) {
            return station;
          }
        })
      );
      return snapshot;
    });
    return this;
  }

  onlyGetDailySnapshots() {
    let dates = [];
    this.collection = this.collection.filter(snapshot => {
      const date = moment(snapshot.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss").substring(0, 10);
      const time = moment(snapshot.createdAt).utc().format("YYYY-MM-DD:THH:mm:ss").substring(12);
      // 17:00:00 UTC is noon Eastern Time (Except for a three week period in March and a week in October-November)
      // But I can live with that for this project.
      if (!dates.includes(date) && time >= "17:00:00") {
        dates.push(date);
        return snapshot;
      }
    });
    return this;
  }
};
