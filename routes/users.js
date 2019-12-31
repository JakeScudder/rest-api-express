'use strict';
const express = require('express');
const router = express.Router();

const { sequelize, models } = require('./db');
const { User, Course } = models;

/////USER Routes

//GET route that returns the currently authenticated user
router.get('/',async (req, res) => {
  const user = await User.findAll();
  console.log(user);
  res.status = 200;
})

//POST route that creates a user, sets the Location header to "/", and returns no content

module.exports = router;