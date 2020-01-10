'use strict';
const express = require('express');
const router = express.Router();

//Access User model from the database
const User = require('../db/models').User;

//Validation, Authorization, and Password Hashing 
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

//Authenticate User Function
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  if (credentials) {
    // const user = User.find(u => u.emailAddress === credentials.name);
    const user = await User.findOne({
      where: { emailAddress: credentials.name }
    });
    console.log(user);
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


/////USER Routes

//GET route that returns the currently authenticated user
router.get('/users', authenticateUser, async (req, res) => {
  const user = req.currentUser;
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.emailAddress,
  })
})

//POST route that creates a user, sets the Location header to "/", and returns no content
router.post('/users',[
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "first name"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "last name"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include your "email"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please type your "password"'),
], async (req, res) => {
  const errors = validationResult(req);
  //If there are validation errors
  if(!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({errors: errorMessages});
  }
  //Create the user
  let user;
  try {
    let email = req.body.emailAddress
    let emailTest = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
    if (emailTest) {
      user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: email,
        password: bcryptjs.hashSync(req.body.password)
      });
      res
      .status(201)
      .location("/")
      .end();
    } else {
      res.status(400).json({message: "Email is not Valid"});
    }
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError"){
        user = await User.build({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          emailAddress: req.body.email,
          password: bcryptjs.hashSync(req.body.password)
        });
        res.status(409).json({message: "Email already exists, please log in."})
    } else {
      throw error;
    }
  }
})

module.exports = router;