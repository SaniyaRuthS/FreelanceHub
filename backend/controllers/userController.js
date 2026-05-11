const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.skills !== undefined) {
        user.skills = Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim());
      }
      if (req.body.expertise !== undefined) {
        user.expertise = req.body.expertise;
      }
      if (req.body.bio !== undefined) {
        user.bio = req.body.bio;
      }

      const updatedUser = await user.save();

      // If user is a freelancer, also update freelancer profile skills for backward compatibility
      if (user.role === 'freelancer' && req.body.skills !== undefined) {
        const freelancer = await FreelancerProfile.findOne({ userId: user._id });
        if (freelancer) {
          freelancer.skills = user.skills;
          await freelancer.save();
        }
      }

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        expertise: updatedUser.expertise,
        bio: updatedUser.bio,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUserProfile, getUserById };
