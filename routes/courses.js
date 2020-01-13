'use strict';
const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

//Require Databases
const Course = require('../db/models').Course;
const User = require('../db/models').User

//Require password hashing and authentication
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

//Authentication
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  if (credentials) {
    const user = await User.findOne({
      where: { emailAddress: credentials.name }
    });
    // console.log(user);
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
  const courses = await Course.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt']}, 
    include: {
        model: User,
        attributes: {exclude: ['password','createdAt', 'updatedAt'] 
      },
    }
  });
  res.status(200).json({courses});
});

//GET route returns a specific course for provided ID
router.get('/courses/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes:{exclude: ['createdAt', 'updatedAt']},
    include: {
      model: User,
      attributes: {exclude: ['password','createdAt', 'updatedAt'] 
    },
  }
  });
  res.status(200).json(course);
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
    const course = await Course.create(req.body);
    res.status(201).location('/courses/:id').json(course);
  } catch (error) {
    console.log(error);
    res.status(400).json({message: error.message})
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
  const user = req.currentUser;
  //If there are errors
  if(!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({errors: errorMessages});
  }
  //Update Course
  try {
    let course = await Course.findByPk(req.params.id);
    if (course) {
      if (user.id === course.userId) {
        course.title = req.body.title;
        course.description = req.body.description;
        await course.update(req.body)
        res.status(204).end();
      } else {
        res.status(403).json({message: "Sorry, you don't have authorization to update this course."})
      }  
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
    const user = req.currentUser;
    let course = await Course.findByPk(req.params.id);
    if (course) {
      if (user.id === course.userId) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(403).json({message: "Sorry, you don't have authorization to delete this course."})
      }
      
    }
  } catch(error) {
    res.status(500).json({message: error.message})
  }
});

module.exports = router;
