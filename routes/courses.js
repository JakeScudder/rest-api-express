'use strict';
const express = require('express');
const router = express.Router();

const { sequelize, models } = require('../db');
const { Course } = models;

/////COURSE Routes

//GET route returns a list of courses

//GET route returns a specific course for provided ID

//POST route creates a course and sets the Location header to the URI for the course, returns no content

//PUT route updates a course, returns no content

//DELETE route deletes a course, returns no content
