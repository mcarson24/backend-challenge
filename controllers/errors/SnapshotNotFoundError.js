module.exports = class SnapshotNotFoundError extends Error {
  constructor(date = '') {
    super();
    this.message = date.length ? `Could not find data for ${date}` : 'No data currently exists.';
    this.status = 404;
  }
}
