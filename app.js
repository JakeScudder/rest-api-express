'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');


// create the Express app
const app = express();

const { sequelize } = require('./db/models');

app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

//Testing dependencies
const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }))

const users = require('./routes/users.js');
const courses = require('./routes/courses.js');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

/*****  TODO setup your api routes here *****/

app.use('/api', users);
app.use('/api', courses);

// Setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  //Set status for Global if not already set
  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// Set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

// Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database has successfully connected');
  } catch(error) {
      console.log('Not able to connect to the database:', error);
  }
})();