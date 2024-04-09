const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const coursesRoutes = require('./routes/coursesRoutes');
const videosRoutes = require('./routes/videosRoutes');
const qrCode = require('qrcode');
const speakeasy = require('speakeasy');

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

// User schema
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true }, // Ensure email is unique
  phoneNumber: String,
  role: String,
  password: String,
  secret: String, // Add field for 2FA secret
});

const User = mongoose.model('User', UserSchema);

app.use(cors());
app.use(express.json());
app.use('/api', videosRoutes);
app.use('/uploads', express.static('uploads'));

// Endpoint to handle login with 2FA
app.post('/api/login', async (req, res) => {
  const { email, password, code } = req.body;
  console.log('Attempting login for email:', email); // Log the email attempting to log in

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: Invalid email'); // Log when no user is found for the provided email
      return res.status(400).send('Invalid email');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Login failed: Invalid password'); // Log when password is invalid
      return res.status(400).send('Invalid password');
    }

    // Generate secret for OTP if not already generated and send it to the client
    if (!user.secret) {
      const secret = speakeasy.generateSecret({ length: 20 });
      await User.findByIdAndUpdate(user._id, { secret: secret.base32 });
      console.log('OTP secret generated for user:', email);
      return res.status(200).send({ message: 'OTP secret generated', requiresOTP: true });
    }

    // Verify OTP
    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allowing 2 periods to account for time skew
    });

    if (verified) {
      console.log('Login successful for:', email); // Log successful login
      res.send({ message: 'Login successful', role: user.role }); // Send back the role of the user
    } else {
      console.log('Login failed: Invalid OTP'); // Log when OTP is invalid
      res.status(400).send('Invalid OTP');
    }
  } catch (error) {
    console.error('Login error:', error); // Log any errors during login
    res.status(500).send('Server error');
  }
});

// Other endpoints...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
