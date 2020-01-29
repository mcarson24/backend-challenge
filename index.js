require('dotenv').config();

const path                  = require('path');
const express               = require('express');
const mongoose              = require('mongoose');
const fetchData             = require('./fetchData');
const apiRoutes             = require('./routes/api');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT;
const FETCH_TIME = 1000 * 60 * 60;

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

setInterval(fetchData, FETCH_TIME);

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api/v1/', apiRoutes);

app.use((req, res, next) => {
  res.status(404)
     .json({
    error: {
      message: 'File not found',
      status: 404
    }
  });
  next();
});

app.use((err, req, res, next) => {
  res.status(err.status)
     .json({
       error: {
         message: err.message,
         status: err.status
       }
     });
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));

module.exports = app;
