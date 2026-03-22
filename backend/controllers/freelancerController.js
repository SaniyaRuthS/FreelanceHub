const FreelancerProfile = require('../models/FreelancerProfile');
const Project = require('../models/Project');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all freelancers (or filter by category)
// @route   GET /api/freelancers
// @access  Public
const getFreelancers = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: category.toLowerCase() } : {};
    
    const freelancers = await FreelancerProfile.find(filter)
      .populate('userId', 'name email');
    
    res.status(200).json(freelancers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single freelancer by ID including projects and reviews
// @route   GET /api/freelancers/:id
// @access  Public
const getFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Support for fallback mock data logic on the frontend if needed
    if (id.startsWith('seeded-')) {
      return res.status(200).json({
        id: id,
        name: "Mocked Profile",
        category: "General",
        title: "Freelancer",
        projects: [],
        reviews: []
      });
    }

    const freelancer = await FreelancerProfile.findById(id).populate('userId', 'name email');
    
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    const projects = await Project.find({ freelancerId: id });
    const reviews = await Review.find({ freelancerId: id }).populate('userId', 'name');

    // Calculate dynamic rating
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1) 
      : freelancer.rating;

    const profileData = {
      _id: freelancer._id,
      name: freelancer.userId ? freelancer.userId.name : "Unknown",
      role: freelancer.title,
      skills: freelancer.skills,
      rating: parseFloat(averageRating),
      totalReviews: reviews.length,
      hourlyRate: freelancer.hourlyRate,
      availability: freelancer.availability,
      experience: freelancer.experience,
      projects: projects || [],
      reviews: reviews || []
    };

    res.status(200).json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFreelancers, getFreelancerById };
