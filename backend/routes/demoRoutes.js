const express = require('express');
const DemoProject = require('../models/DemoProject');
const { protect, freelancerOnly } = require('../middleware/authMiddleware');
const Freelancer = require('../models/Freelancer');

const router = express.Router();

// GET /api/demos/:freelancerId
router.get('/:freelancerId', async (req, res) => {
  try {
    const demos = await DemoProject.find({ freelancerId: req.params.freelancerId });
    res.json(demos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/demos
router.post('/', protect, freelancerOnly, async (req, res) => {
  try {
    const { title, description, demoLink } = req.body;
    const freelancer = await Freelancer.findOne({ userId: req.user.id });
    
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    const newDemo = await DemoProject.create({
      freelancerId: freelancer._id,
      title,
      description,
      demoLink
    });

    res.status(201).json(newDemo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
