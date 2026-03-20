const express = require('express');
const Freelancer = require('../models/Freelancer');

const router = express.Router();

// GET /api/freelancers?category=categoryName
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }; 
    }
    const freelancers = await Freelancer.find(query).populate('userId', 'name email');
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/freelancers/:id
router.get('/:id', async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id).populate('userId', 'name email');
    if (freelancer) {
      res.json(freelancer);
    } else {
      res.status(404).json({ message: 'Freelancer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
