// coursesRoutes.js
const express = require('express');
const Course = require('../Models/Course');

const router = express.Router();

// POST: Create a new course
router.post('/', async (req, res) => {
  console.log('Creating a new course...');
  const { title, description, url } = req.body;

  try {
    console.log('Creating new Course object...');
    const newCourse = new Course({
      title,
      description,
      url,
    });

    console.log('Saving the new course to the database...');
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET: Retrieve all courses
router.get('/', async (req, res) => {
  console.log('Retrieving all courses...');
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured', async (req, res) => {
  console.log('Retrieving featured courses...');
  try {
    const featuredCourses = await Course.find({ featured: true });
    res.json(featuredCourses);
  } catch (error) {
    console.error('Error retrieving featured courses:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET: Retrieve a single course by ID
router.get('/:id', async (req, res) => {
  console.log('Retrieving a single course...');
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error('Error retrieving course by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update a course by ID
router.put('/:id', async (req, res) => {
  console.log('Updating a course...');
  const { title, description, url } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, url },
      { new: true }
    );
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a course by ID
router.delete('/:id', async (req, res) => {
  console.log('Deleting a course...');
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (deletedCourse) {
      res.json({ message: 'Course deleted successfully' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
