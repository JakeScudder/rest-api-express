'use strict';
const express = require('express');
const router = express.Router();

const { sequelize, models } = require('../db');
const { User, Course } = models;

/////USER Routes

//GET route that returns the currently authenticated user
router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
  res.status(200).end();
})

//POST route that creates a user, sets the Location header to "/", and returns no content
router.post('/users', async (req, res) => {
  let user;
  try {
    user = await User.create(req.body);
    res
      .status(201)
      .redirect("/")
      .end();
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;