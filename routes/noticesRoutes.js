const express = require('express');
const Notice = require('../Models/Notice');
const router = express.Router();

// Get all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find();
    res.json(notices);
  } catch (error) {
    res.status(500).send('Error fetching notices');
  }
});

// Post a new notice
router.post('/', async (req, res) => {
  try {
    const newNotice = new Notice(req.body);
    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (error) {
    res.status(500).send('Error saving notice');
  }
});

module.exports = router;
