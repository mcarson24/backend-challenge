require('dotenv').config();

const express               = require('express');
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const apiRoutes             = require('./routes/api');

const app = express();
const PORT = process.env.PORT;

let mongoServer;

(async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  if (process.env.NODE_ENV == 'test') { // Connect to an in-memory instance of mongodb
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, options);
  } else {
    mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, options);
    mongoServer = mongoose.connection;
  }
})();


app.use('/api/v1/', apiRoutes);

app.use((req, res, next) => {
  res.status(404)
     .json({
    error: {
      message: 'File not found',
      status: 404
    }
  });
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));

module.exports = app;
