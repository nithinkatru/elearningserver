const express = require('express');
const multer = require('multer');
const Video = require('../Models/Video'); 


const router = express.Router();

router.post('/videos', async (req, res) => {
  const { title, url, description } = req.body;
  const newVideo = new Video({ title, url, description });
  
  try {
    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
