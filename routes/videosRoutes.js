const express = require('express');
const multer = require('multer');
const Video = require('../Models/Video');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log("Uploading file...", file.originalname); // Log the name of the file being uploaded
    cb(null,'uploads/'); 
  },
  filename: function(req, file, cb) {
    console.log("Processing file...", file.originalname); // Log the file processing
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/videos', upload.single('videoFile'), async (req, res) => {
  const { title, url, description, courseId } = req.body;

  console.log("Received video upload request", req.body); // Log the request body
  
  // Include handling for the file
  const videoFile = req.file ? req.file.path : null;

  if (videoFile) {
    console.log("Video file path:", videoFile); // Log the path of the uploaded video file
  } else {
    console.log("No video file uploaded.");
  }

  const newVideo = new Video({
    title,
    url,
    description,
    courseId,
    videoFile 
  });

  try {
    const savedVideo = await newVideo.save();
    console.log("Video saved successfully", savedVideo); // Log the saved video
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error("Error saving video", error.message); // Log any errors
    res.status(400).json({ message: error.message });
  }
});

router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find();
    console.log("Fetched videos", videos); // Log the fetched videos
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos", error.message); // Log any errors
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;