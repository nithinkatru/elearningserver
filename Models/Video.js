const mongoose = require('mongoose');

// Define the schema
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  courseId: mongoose.Schema.Types.ObjectId, // Reference to Course
  videoFile: String, // Path to the video file
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
