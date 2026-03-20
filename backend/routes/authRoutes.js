const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({ name, email, password, role });

    let freelancerProfile = null;
    if (role === 'freelancer') {
      const { category, skills, bio } = req.body;
      freelancerProfile = await Freelancer.create({
        userId: user._id,
        name: user.name,
        category: category || 'Web Development',
        skills: skills || [],
        bio: bio || ''
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
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      let freelancerId = null;
      if (user.role === 'freelancer') {
        const freelancer = await Freelancer.findOne({ userId: user._id });
        if (freelancer) freelancerId = freelancer._id;
      }

      res.json({
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
});

module.exports = router;
