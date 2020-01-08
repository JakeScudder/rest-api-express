'use strict';
const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { check, validationResult } = require('express-validator');

const { sequelize, models } = require('../db');
const { Course } = models;

//Require password hashing and authentication
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

//Authentication
const authenticateUser = (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  const name = credentials.name
  if (credentials) {
    // const user = User.find(u => u.emailAddress === credentials.name);
    const user = User.find({
      where: {emailAddress: name }
    });
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password)
      if (authenticated) {
        console.log(`Authentication successful for: ${user.emailAddress}`);
        req.currentUser = user;
      } else {
        message = `Could not authenticate ${user.emailAddress}`;
      }
    } else {
      message = `Could not find the username: ${user.emailAddress}`;
    } 
  } else {
    message = `Authenticate header not found`;
  }
  if (message) {
    console.warn(message);
    res.status(401).json({message: "Access denied" });
  } else {
    next();
  }
}

/////COURSE Routes

//GET route returns a list of courses
router.get('/courses', async (req, res) => {
  const courses = await Course.findAll();
  res.status(200).json(courses);
});

//GET route returns a specific course for provided ID
router.get('/courses/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id)
  res.status(200).json(course).json(course.userId);
});

//POST route creates a course and sets the Location header to the URI for the course, returns no content
router.post('/courses', [
  check('title') 
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "course title"'),
  check('description') 
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "course description"'),
], authenticateUser, async (req, res) => {
  const errors = validationResult(req);
  //If there are errors
  if(!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({errors: errorMessages});
  }
  //Create course
  try {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description
    })
    res.status(201).json(course);
  } catch(error) {
    res.json({message: error.message})
  }
});

//PUT route updates a course, returns no content
router.put('/courses/:id', [
  check('title') 
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "course title"'),
  check('description') 
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "course description"'),
], authenticateUser, async (req, res) => {
  const errors = validationResult(req);
  //If there are errors
  if(!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({errors: errorMessages});
  }
  //Update Course
  try {
    let course = await Course.findByPk(req.params.id);
    if (course) {
      course.title = req.body.title;
      course.description = req.body.description;
      await course.update(req.body)
      res.status(204).end();
    } else {
      res.status(404).json({message: "Course not found"});
    }
  } catch(error) {
    res.status(500).json({message: error.message})
  }
});

//DELETE route deletes a course, returns no content
router.delete('/courses/:id', authenticateUser, async (req, res) => {
  try {
    let course = await Course.findByPk(req.params.id);
    if (course) {
      await course.destroy();
      res.redirect("/courses");
    }
  } catch(error) {
    res.status(500).json({message: error.message})
  }
});

module.exports = router;
