  const express = require('express');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const coursesRoutes = require('./routes/coursesRoutes');
  const videosRoutes = require('./routes/videosRoutes');
  const qrCode = require('qrcode');
  const speakeasy = require('speakeasy');
  const app = express();
  const PORT = process.env.PORT || 5000;

  const User = require('./Models/User');
  const login = require('./routes/login')
  const QuizSubmission = require('./Models/QuizSubmission'); // Adjust the path as needed


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




  app.use(cors());
  app.use(express.json());
  app.use('/api', videosRoutes);
  app.use('/uploads', express.static('uploads'));

  // Endpoint to fetch user details by email
app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).send('User not found');
    }

    console.log('User found:', user);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Server Error');
  }
});

// Endpoint to validate login credentials
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: Invalid email');
      return res.status(400).send('Invalid email');
    }

    if (user.password !== password) {
      console.log('Login failed: Incorrect password');
      return res.status(400).send('Incorrect password');
    }

    console.log('Login successful for:', email);
    res.send({ message: 'Login successful', email: user.email, role: user.role }); // Include user's email in the response
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
});



  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });


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
  // const User = mongoose.model('User', UserSchema);
  // // Quiz schema
  // const OptionSchema = new mongoose.Schema({
  //   optionText: String,
  //   isCorrect: Boolean,
  // });

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

  app.post('/api/submit-quiz', async (req, res) => {
    const { quizId, answers } = req.body;
    try {
      // Retrieve the quiz from the database
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
  
      // Calculate the grade based on the submitted answers
      let score = 0;
      quiz.questions.forEach((question, index) => {
        const submittedAnswer = answers[index];
        const correctAnswer = question.options.find(option => option.isCorrect);
        if (submittedAnswer === correctAnswer.optionText) {
          score += 1; // Increment score if submitted answer matches correct answer
        }
      });
  
      // Save the submission and grade to the database
      const submission = new QuizSubmission({ quizId, answers, score });
      await submission.save();
  
      res.status(201).json({ message: 'Submission received', score });
    } catch (error) {
      console.error('Error saving submission:', error);
      res.status(500).send('Error saving submission');
    }
  });
  
  
 // Endpoint to create a new user with plain text password
app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, role, password } = req.body;
  console.log('Creating new user:', req.body); // Log the data received to create a new user

  const newUser = new User({ firstName, lastName, email, phoneNumber, role, password });

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

  const NoticeSchema = new mongoose.Schema({
    message: String,
    targetAudience: {
      type: String,
      enum: ['educator', 'student', 'all'], // Specifies who the notice is for
      required: true
      
    },
    // include other fields as necessary, like datePosted, postedBy, etc.
  });



  app.post('/api/notices', async (req, res) => {
    const { message, targetAudience } = req.body;

    if (!message || !targetAudience) {
      return res.status(400).send('Notice message and target audience are required');
    }

    try {
      const newNotice = new Notice({ message, targetAudience });
      await newNotice.save();
      res.status(201).json(newNotice);
    } catch (error) {
      console.error('Error saving notice:', error);
      res.status(500).send('Error saving notice');
    }
  });


  app.get('/api/notices', async (req, res) => {
    try {
      const notices = await Notice.find(); // Assuming Notice is your Mongoose model
      res.json(notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).send('Error fetching notices');
    }
  });

  const Notice = mongoose.model('Notice', NoticeSchema);

  // server.js or in your routes file

  app.delete('/api/notices/:id', async (req, res) => {
    try {
      const result = await Notice.findByIdAndDelete(req.params.id);
      if (result) {
        res.status(200).send({ message: 'Notice deleted successfully' });
      } else {
        res.status(404).send({ message: 'Notice not found' });
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      res.status(500).send({ message: 'Error deleting notice' });
    }
  });



  // Endpoint to get all educators and students
  app.get('/api/users', async (req, res) => {
      try {
          // Fetch users who are either educators or students
          const users = await User.find({
              role: { $in: ['educator', 'student'] }
          });
          res.json(users);
      } catch (error) {
          console.error('Error fetching users:', error);
          res.status(500).send('Server Error');
      }
  });

  // Delete a user
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send('Server Error');
    }
  });

  // Update a user
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedUser) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Server Error');
    }
  });
