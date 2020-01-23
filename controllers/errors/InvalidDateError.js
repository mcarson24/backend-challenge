module.exports = class InvalidDateError extends Error {
  constructor() {
    super();
    this.message = 'The request was incorrectly formed. The dates are invalid.';
    this.status = 400;
  }
}
