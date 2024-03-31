const mongoose = require('mongoose');

// Option schema
const OptionSchema = new mongoose.Schema({
  optionText: String,
  isCorrect: Boolean,
});

// Question schema
const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [OptionSchema],
});

// Quiz schema
const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [QuestionSchema],
});

// Quiz model
const Quiz = mongoose.model('Quiz', QuizSchema);
