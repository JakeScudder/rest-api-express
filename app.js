'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

// create the Express app
const app = express();

app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

//Testing dependencies
const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }))


//Accessing the database connection
const { sequelize, models } = require('./db');
const { User, Course } = models;

console.log('Testing the database connection');
//Testing database connection, synchronizing the models and creating entries
(async () => {
  try {
    console.log('Database Connected');
    await sequelize.authenticate();
  } catch(error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        console.error('Validation errors: ', errors);
      } else {
        throw error;
      }
  }
})();



// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

/*****  TODO setup your api routes here *****/

app.use('/api', User);
app.use('/api', Course);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});



/////COURSE Routes

//GET route returns a list of courses

//GET route returns a specific course for provided ID

//POST route creates a course and sets the Location header to the URI for the course, returns no content

//PUT route updates a course, returns no content

//DELETE route deletes a course, returns no content





// send 404 if no other route matched
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

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
