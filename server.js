// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const coursesRoutes = require('./routes/coursesRoutes');
const videosRoutes = require('./routes/videosRoutes');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://nithinkumarkatru:hello@cluster0.zrplywq.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Course model if not already defined
if (!mongoose.models.Course) {
  const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    url: String,
    featured: Boolean,
  });

  mongoose.model('Course', CourseSchema);
}

const requireSuperAdmin = async (req, res, next) => {
  // This assumes you have decoded the JWT token and set the user in req.user
  if (req.user && req.user.role === 'superAdmin') {
    next();
  } else {
    res.status(403).send('Access denied. Requires super admin role.');
  }
};


// User schema
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true }, // Ensure email is unique
  phoneNumber: String,
  role: String,
  password: String
});

const User = mongoose.model('User', UserSchema);
// Quiz schema
const OptionSchema = new mongoose.Schema({
  optionText: String,
  isCorrect: Boolean,
});

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [OptionSchema],
});

const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [QuestionSchema],
});

const Quiz = mongoose.model('Quiz', QuizSchema);
app.use(cors());
app.use(express.json());
app.use('/api', videosRoutes);
app.use('/uploads', express.static('uploads'));

// Endpoint to handle quiz submissions
app.post('/api/submit-quiz', async (req, res) => {
  const { quizId, answers } = req.body;
  try {
      // Save the submission to the database
      const submission = new QuizSubmission({ quizId, answers });
      await submission.save();

      res.status(201).json({ message: 'Submission received' });
  } catch (error) {
      console.error('Error saving submission:', error);
      res.status(500).send('Error saving submission');
  }
});

// QuizSubmission schema (create this in your models)
const QuizSubmissionSchema = new mongoose.Schema({
  quizId: mongoose.Schema.Types.ObjectId,
  answers: Object, // or a more detailed schema if needed
});

const QuizSubmission = mongoose.model('QuizSubmission', QuizSubmissionSchema);
// Endpoint to create a new user with hashed password
app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, role, password } = req.body;
  console.log('Creating new user:', req.body); // Log the data received to create a new user

  // Hash password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ firstName, lastName, email, phoneNumber, role, password: hashedPassword });

  try {
    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser); // Log the saved user
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error); // Log any errors encountered
    res.status(500).send('Error creating user');
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/courses', coursesRoutes);

// Endpoint to handle login

app.post('/api/login', async (req, res) => {
  const { email } = req.body;
  console.log('Attempting login for email:', email); // Log the email attempting to log in

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: Invalid email'); // Log when no user is found for the provided email
      return res.status(400).send('Invalid email');
    }

    // Assuming password check logic is here...

    console.log('Login successful for:', email); // Log successful login
    res.send({ message: 'Login successful', role: user.role }); // Send back the role of the user
  } catch (error) {
    console.error('Login error:', error); // Log any errors during login
    res.status(500).send('Server error');
  }
});

// server.js
// Ensure Quiz is defined here if it's in another file
// const Quiz = require('./models/Quiz');

// Quiz Routes
app.post('/api/quizzes', async (req, res) => {
  const { title, description, questions } = req.body;
  try {
    const newQuiz = new Quiz({ title, description, questions });
    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).send('Error saving quiz');
  }
});

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).send('Error fetching quizzes');
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).send('Error fetching quiz');
  }
});

app.put('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).send('Error updating quiz');
  }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    res.send('Quiz deleted successfully');
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).send('Error deleting quiz');
  }
});

// Endpoint to retrieve enrollment analytics
app.get('/enrollment-analytics', async (req, res) => {
  try {
    // Aggregate to count the number of students
    const studentCount = await User.aggregate([
      { $match: { role: 'student' } }, // Filter documents by role: student
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 } // Count the number of documents that match
        }
      },
      {
        $project: {
          _id: 0,
          role: '$_id',
          students: '$count'
        }
      }
    ]);

    // Format the data to match your frontend expectations
    const formattedData = studentCount.map(item => ({
      name: item.role.charAt(0).toUpperCase() + item.role.slice(1), // Capitalize the role name
      students: item.students
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Failed to retrieve enrollment analytics:", error);
    res.status(500).send('Error retrieving enrollment analytics');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
