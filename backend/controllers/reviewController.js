const Review = require('../models/Review');
const FreelancerProfile = require('../models/FreelancerProfile');

// @desc    Get reviews for a freelancer
// @route   GET /api/reviews/:freelancerId
// @access  Public
const getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.freelancerId })
      .populate('userId', 'name')
      .sort('-createdAt');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (User)
const addReview = async (req, res) => {
  try {
    const { freelancerId, rating, comment } = req.body;
    
    const freelancer = await FreelancerProfile.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    const review = await Review.create({
      freelancerId,
      userId: req.user._id,
      rating,
      comment
    });

    // Update freelancer rating
    const reviews = await Review.find({ freelancerId });
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    freelancer.rating = averageRating.toFixed(1);
    freelancer.reviewsCount = reviews.length;
    await freelancer.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFreelancerReviews, addReview };
