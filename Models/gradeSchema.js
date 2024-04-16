const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    grade: {
        type: Number,
        required: true
    },
    quizTitle: {
        type: String, // Optional: store for quick access if needed
    },
    userName: {
        type: String, // Optional: store for quick access if needed
    }
});

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
