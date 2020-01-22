process.env.NODE_ENV = 'test';

const { expect, should }  = require('chai')
const request             = require('supertest');
const app                 = require('../../index')
const Snapshot            = require('../../app/models/snapshot');

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
    it('should return the closest snapshot data after a particular date and time', done => {
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
    });
    it('should return data for a single station', done => {
      Snapshot.create({
        stations: JSON.stringify([
          { 
            properties: {
              kioskId: 3098 
            }
          }, 
          { 
            properties: {
              kioskId: 3093 
            }
          }
        ]),
        weather: JSON.stringify({}),
        createdAt: Date.parse("2020-01-21 00:00:00+00:00")
      });
      request(app)
        .get('/api/v1/stations/3098?at=2020-01-20T10:30:00')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          // expect(res.body.station.properties).to.deep.equal({ "kioskId": 3098 });
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
    });
    it('should return data for a single station', done => {
      Snapshot.create({
        stations: JSON.stringify([
          { 
            properties: {
              kioskId: 3098 
            }
          }, 
          { 
            properties: {
              kioskId: 3093 
            }
          }
        ]),
        weather: JSON.stringify({}),
        createdAt: Date.parse("2020-01-21 00:00:00+00:00")
      });
      request(app)
        .get('/api/v1/stations/3098?at=2020-01-20T10:30:00')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.station).to.deep.equal({ "properties": { "kioskId": 3098 }});
          done();
        });
    });
    it("should return 404 if there is no data after the specified time", done => {
      Snapshot.create({
        stations: JSON.stringify({}),
        weather: JSON.stringify({}),
        createdAt: Date.parse("2005-01-20 00:00:00+00:00")
      });
      request(app)
        .get("/api/v1/stations?at=2020-01-20T11:00:00")
        .expect("Content-Type", /json/)
        .expect(404, done);
    });
    it("should return 400 for a single station if no at query parameter is specified", done => {
      Snapshot.create({
        stations: JSON.stringify([
          { properties: { kioskId: 3098 } }
        ]),
        weather: JSON.stringify({}),
        createdAt: Date.parse("2020-01-20 00:00:00+00:00")
      });
      request(app)
        .get("/api/v1/stations/3098")
        .expect("Content-Type", /json/)
        .expect(400)
        .end((err, res) => {
          const error = JSON.parse(res.error.text);
          expect(error.error.message).to.equal("The request was incorrectly formed. The 'at' parameter was missing.");
          done();
        });
    });
    it("should return 400 for a single station if either of the date query parameters are invalid", done => {
      Snapshot.create({
        stations: JSON.stringify([{ properties: { kioskId: 3098 } }]),
        weather: JSON.stringify({}),
        createdAt: Date.parse("2020-01-20 00:00:00+00:00")
      });
      request(app)
        .get("/api/v1/stations/3098?at=2020-011-01T12:00:00")
        .expect(400)
        .end((err, res) => {
          const error = JSON.parse(res.error.text);
          expect(error.error.message).to.equal(
            "The request was incorrectly formed. The dates are invalid."
          );
        });
      request(app)
        .get("/api/v1/stations/3098?from=2020-011-01T12:00:00&to=202-01-22T:23:00:00")
        .expect(400)
        .end((err, res) => {
          const error = JSON.parse(res.error.text);
          expect(error.error.message).to.equal(
            "The request was incorrectly formed. The dates are invalid."
          );
          done();
        });
    });
    it('should return a range of snapshots for a station over a specified period of time', done => {
      Snapshot.create({
        createdAt: Date.parse("2020-01-10 01:00:00+00:00"),
        stations: JSON.stringify([
          { properties: { kioskId: 3098 } },
          { properties: { kioskId: 3093 } }
        ]),
        weather: "{}"
      });
      Snapshot.create({
        createdAt: Date.parse("2020-01-10 02:00:00+00:00"),
        stations: JSON.stringify([
          { properties: { kioskId: 3098 } },
          { properties: { kioskId: 3093 } }
        ]),
        weather: "{}"
      });
      Snapshot.create({
        createdAt: Date.parse("2020-01-10 03:00:00+00:00"),
        stations: JSON.stringify([
          { properties: { kioskId: 3098 } },
          { properties: { kioskId: 3093 } }
        ]),
        weather: "{}"
      });
      Snapshot.create({
        createdAt: Date.parse("2020-01-18 02:00:00+00:00"),
        stations: JSON.stringify([
          { properties: { kioskId: 3098 } },
          { properties: { kioskId: 3093 } }
        ]),
        weather: "{}"
      });
      request(app)
        .get(
          "/api/v1/stations/3098?from=2020-01-10T00:00:00&to=2020-01-15T01:00:00"
        )
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.equal(3);
          res.body.map(snapshot => {
            expect(snapshot.station.properties.kioskId).to.equal(3098)
          });
          done();
        });
    });
    // it("should return a range of daily snapshots for a station over a specified period of time when frequency is set to daily", done => {
    //   Snapshot.create({
    //     createdAt: Date.parse("2020-01-10 01:00:00+00:00"),
    //     stations: JSON.stringify([]),
    //     weather: "{}"
    //   });
    //   Snapshot.create({
    //     createdAt: Date.parse("2020-01-10 02:00:00+00:00"),
    //     stations: JSON.stringify([]),
    //     weather: "{}"
    //   });
    //   Snapshot.create({
    //     createdAt: Date.parse("2020-01-11 03:00:00+00:00"),
    //     stations: JSON.stringify([]),
    //     weather: "{}"
    //   });
    //   Snapshot.create({
    //     createdAt: Date.parse("2020-01-15 02:00:00+00:00"),
    //     stations: JSON.stringify([]),
    //     weather: "{}"
    //   });
    //   request(app)
    //     .get(
    //       "/api/v1/stations/3098?from=2020-01-10T00:00:00&to=2020-01-15T23:59:59&frequency=daily"
    //     )
    //     .expect(200)
    //     .end((err, res) => {
    //       expect(res.body.length).to.equal(3);
    //       done();
    //     });
    // });
  });
});
