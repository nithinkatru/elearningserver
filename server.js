const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb+srv://nithinkumarkatru:hello@cluster0.zrplywq.mongodb.net/');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  role: String,
  password: String // Consider hashing this before storage
 
});
console.log('your in user schema')
const User = mongoose.model('User', UserSchema);

app.use(bodyParser.json());
app.use(cors());

app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, role, password } = req.body;
  // Add server-side validation here as needed
  const newUser = new User({ firstName, lastName, email, phoneNumber, role, password });
  try {
    await newUser.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
