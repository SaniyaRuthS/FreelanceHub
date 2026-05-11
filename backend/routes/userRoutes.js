const express = require('express');
const router = express.Router();
const { updateUserProfile, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').put(protect, updateUserProfile);
router.route('/:id').get(getUserById);

module.exports = router;
