const moment = require('moment');

module.exports = class Time {
  constructor(time = '') {
    this.time = time.length ? new Date(time) : new Date;
  }

  get toString() {
    return this.time.toString().trim();
  }

  get formatted() {
    return moment(this.time)
      .utc()
      .format('YYYY-MM-DD:THH:mm:ss');
  }
}
