// // index.js (server-side code)

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const md5 = require('md5'); // Import md5 library

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB (make sure MongoDB is running)
// mongoose.connect('mongodb+srv://nithinkumarkatru:hello@cluster0.zrplywq.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });
    
// // Define MongoDB schema
// const userSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: String,
//   phoneNumber: String,
//   role: String,
//   password: String
// });

// const User = mongoose.model('User', userSchema);

// // Middleware to parse JSON body
// app.use(bodyParser.json());

// // Handle POST requests to /api/signup
// app.post('/api/signup', async (req, res) => {
//   try {
//     // Extract data from request body
//     const { firstName, lastName, email, phoneNumber, role, password } = req.body;

//     // Create new user document
//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       role,
//       password: md5(password) // Encrypt password using md5 before saving
//     });

//     // Save user to MongoDB
//     await newUser.save();

//     // Send success response
//     res.status(201).json({ message: 'User created successfully' });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     // Send error response
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
