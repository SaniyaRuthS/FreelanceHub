const express = require('express');
const router = express.Router();
const { getFreelancers, getFreelancerById } = require('../controllers/freelancerController');

router.route('/').get(getFreelancers);
router.route('/:id').get(getFreelancerById);

module.exports = router;
