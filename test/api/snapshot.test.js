process.env.NODE_ENV = 'test';

const { expect, should }  = require('chai')
const request             = require('supertest');
const app                 = require('../../')
const Snapshot            = require('../../models/snapshot');

describe('Snapshot', () => {
  afterEach(done => {
    Snapshot.deleteMany({}, err => {
      done();
    });
  });
  describe('getting all stations', () => {
    console.log(Snapshot);
    it('should return a 404 when no snapshots found', done => {
      request(app)
        .get('/api/v1/stations')
        .set('Accept', 'application/json')
        .expect(404, done);
    });
    it('should return the most recent snapshot data when no date is specified', done => {
      Snapshot.create({
        stations: JSON.stringify([{}]),
        weather: JSON.stringify({}),
        createdAt: '2020-01-01 00:00:00+00:00'
      });
      Snapshot.create({
        stations: JSON.stringify([{}]),
        weather: JSON.stringify({}),
        createdAt: '2020-01-20 12:05:00+00:00'
      });
      request(app)
        .get('/api/v1/stations')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.at).to.equal("2020-01-20:T12:05:00");
          done();
        });
    });
    it('should return the closest snapshot data for a particular date and time', done => {
      const dates = [
        "2020-01-01 00:00:00+00:00",
        "2020-01-20 02:00:00+00:00",
        "2020-01-20 11:05:00+00:00",
        "2020-01-20 12:05:00+00:00"
      ];
      // Create snapshots for multiple dates, so we can 
      // test that the api will return the correct one.
      dates.map(date => {
        Snapshot.create({
          stations: JSON.stringify({}),
          weather: JSON.stringify({}),
          createdAt: Date.parse(date)
        });
      });
      request(app)
        .get('/api/v1/stations?at=2020-01-20T11:00:00')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.at).to.equal('2020-01-20:T11:05:00');
          done();
        });
    });
    it('should return 404 if there is no data after the specified time', done => {
      Snapshot.create({
        stations: JSON.stringify({}),
        weather: JSON.stringify({}),
        createdAt: Date.parse("2005-01-20 00:00:00+00:00")
      });
      request(app)
        .get("/api/v1/stations?at=2020-01-20T11:00:00")
        .expect("Content-Type", /json/)
        .expect(404, done)
    })
  });
});
