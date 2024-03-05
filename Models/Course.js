const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  // Add more fields as necessary
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;
