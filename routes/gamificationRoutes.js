const express = require('express');
const router = express.Router();
const Gamification = require('../Models/Gamification');

// Get gamification data for a user
router.get('/:userId', async (req, res) => {
  try {
    const gamification = await Gamification.findOne({ userId: req.params.userId });
    if (!gamification) {
      return res.status(404).json({ message: "No gamification data found for this user." });
    }
    res.json(gamification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update points and badges
router.put('/:userId', async (req, res) => {
  const { points, badge } = req.body;
  try {
    const gamification = await Gamification.findOneAndUpdate(
      { userId: req.params.userId },
      { $inc: { points: points }, $push: { badges: badge }},
      { new: true }
    );
    res.json(gamification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
