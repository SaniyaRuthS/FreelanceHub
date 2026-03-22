const express = require('express');
const router = express.Router();
const { getFreelancerReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addReview);

router.route('/:freelancerId')
    .get(getFreelancerReviews);

module.exports = router;
