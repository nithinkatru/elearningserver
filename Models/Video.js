const mongoose = require('mongoose');

// Define the schema
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  // You can add more fields as needed
});

// Create the model from the schema
const Video = mongoose.model('Video', videoSchema); // Correct usage

module.exports = Video;
