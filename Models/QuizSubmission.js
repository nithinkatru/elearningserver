const mongoose = require('mongoose');

// Define QuizSubmission schema
const QuizSubmissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz' // Reference to the Quiz model
  },
  answers: Object,
  score: Number,
  totalQuestions: Number,
  percentage: Number
});

// Create QuizSubmission model
const QuizSubmission = mongoose.model('QuizSubmission', QuizSubmissionSchema);

module.exports = QuizSubmission; // Export the model
