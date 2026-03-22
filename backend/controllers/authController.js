const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const normalizedRole = role.toLowerCase();
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole
    });

    let freelancerProfile = null;
    if (normalizedRole === 'freelancer') {
      const { title, skills, hourlyRate, category } = req.body;
      freelancerProfile = await FreelancerProfile.create({
        userId: user._id,
        title: title || 'Full Stack Developer',
        skills: skills || [],
        hourlyRate: hourlyRate || 0,
        category: category || 'web-development'
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
      freelancerId: freelancerProfile ? freelancerProfile._id : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      let freelancerId = null;
      if (user.role === 'freelancer') {
        const freelancer = await FreelancerProfile.findOne({ userId: user._id });
        if (freelancer) freelancerId = freelancer._id;
      }

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        freelancerId
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
