const express = require('express');
const Review = require('../models/Review');
const Freelancer = require('../models/Freelancer');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/reviews/:freelancerId
router.get('/:freelancerId', async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.freelancerId }).populate('userId', 'name').sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { freelancerId, rating, comment } = req.body;
    
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    const review = await Review.create({
      freelancerId,
      userId: req.user.id,
      rating,
      comment
    });

    const reviews = await Review.find({ freelancerId });
    const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
    freelancer.rating = totalRating / reviews.length;
    await freelancer.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
