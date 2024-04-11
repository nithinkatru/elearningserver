const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  message: String,
  targetAudience: {
    type: String,
    enum: ['educator', 'student', 'all'],
    required: true,
  },
  // include other fields as necessary, like datePosted, postedBy, etc.
});

module.exports = mongoose.model('Notice', NoticeSchema);
