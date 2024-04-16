const mongoose = require('mongoose');

const QuizSubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: Array,
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  grade: String,
  graded: { type: Boolean, default: false },
  published: { type: Boolean, default: false }
});

const QuizSubmission = mongoose.model('QuizSubmission', QuizSubmissionSchema);

module.exports = QuizSubmission;
