const moment = require('moment');

module.exports = class SnapshotCollection {
  constructor(snapshots = []) {
    this.collection = snapshots; 
  }

  get json() {
    if (this.wantsSingleStation && this.wantsRangeOfSnapshots) {
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
    if (this.wantsSingleStation) {
      return {
        at: moment(this.collection[0].createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        station: JSON.parse(this.collection[0].stations)[0],
        weather: JSON.parse(this.collection[0].weather)
      };
    }
    if (this.collection.length == 1) {
      return {
        at: moment(this.collection[0].createdAt)
        .utc()
        .format("YYYY-MM-DD:THH:mm:ss"),
        stations: JSON.parse(this.collection[0].stations),
        weather: JSON.parse(this.collection[0].weather)
      };
    }
    return this.collection.map(snapshot => {
      return {
        at: moment(snapshot.createdAt)
          .utc()
          .format("YYYY-MM-DD:THH:mm:ss"),
        station: JSON.parse(snapshot.stations),
        weather: JSON.parse(snapshot.weather)
      };
    });
  }

  async between(from, to) {
    this.wantsRangeOfSnapshots = true;

    this.collection = await Snapshot.between(from, to);

    return this;
  }

  empty() {
    return this.collection.length < 1;
  }

  onlyGetStationDataFor(kioskId) {
    this.wantsSingleStation = true;

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
