const mongoose = require('mongoose');

const GamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    title: String,
    awardedDate: Date
  }]
});

module.exports = mongoose.model('Gamification', GamificationSchema);
