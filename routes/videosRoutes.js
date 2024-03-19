const express = require('express');
const multer = require('multer');
const Video = require('../Models/Video'); 

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/videos', upload.single('videoFile'), async (req, res) => {
  const { title, url, description, courseId } = req.body;
  
  // Include handling for the file
  const videoFile = req.file ? req.file.path : null;

  const newVideo = new Video({
    title,
    url,
    description,
    courseId,
    videoFile // Save the path of the video file (if uploaded)
  });

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
