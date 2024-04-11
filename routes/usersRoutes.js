const express = require('express');
const User = require('../Models/User');
const router = express.Router();

// Register a new user
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

module.exports = router;
