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
    it('should return a 200', done => {
      request(app)
        .get('/api/v1/stations')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
    it('should return all the snapshot data', done => {
      Snapshot.create({
        station: JSON.stringify([
          {
            geometry: { coordinates: [-75.16042, 39.93431], type: "Point" },
            properties: {
              addressStreet: "1201 S. 10th Street",
              addressCity: "Philadelphia",
              addressState: "PA",
              addressZipCode: "19147",
            },
            type: "Feature"
          }
        ]),
        weather: JSON.stringify({
          coord: { lon: -75.16, lat: 39.95 },
          weather: [
            { id: 800, main: "Clear", description: "clear sky", icon: "01d" }
          ],
          timezone: -18000,
          id: 4560349,
          name: "Philadelphia",
          cod: 200
        })
      });
      request(app)
        .get('/api/v1/stations')
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body.length).to.equal(1);
          done();
        });
    });
    it('should return the closest snapshot data for a particular date and time', done => {
      const addresses = [
          '1201 S. 10th Street',
          '191 S. 2nd St.',
          '1076 Berks Street'
      ];
      const dates = [
        "2020-01-01 00:00:00+00:00",
        "2020-01-20 02:00:00+00:00",
        "2020-01-20 11:05:00+00:00",
        "2020-01-20 12:05:00+00:00"
      ];
      let stationData = [];
      addresses.map(address => {
        stationData.push({
          geometry: { coordinates: [-75.16042, 39.93431], type: "Point" },
          properties: {
            addressStreet: address,
            addressCity: "Philadelphia",
            addressState: "PA",
          },
          type: "Feature"
        });
      });
      dates.map(date => {
        Snapshot.create({
          station: JSON.stringify(stationData),
          weather: JSON.stringify({
            coord: { lon: -75.16, lat: 39.95 },
            weather: [
              { id: 800, main: "Clear", description: "clear sky", icon: "01d" }
            ],
            timezone: -18000,
            id: 4560349,
            name: "Philadelphia",
            cod: 200
          }),
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
  });
});
