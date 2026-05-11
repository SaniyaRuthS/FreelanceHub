const express = require('express');
const router = express.Router();
const { createGig, getGigs, getGigById, getMyGigs, updateGig, deleteGig } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getGigs)
  .post(protect, createGig);

router.route('/my')
  .get(protect, getMyGigs);

router.route('/:id')
  .get(getGigById)
  .put(protect, updateGig)
  .delete(protect, deleteGig);

module.exports = router;
