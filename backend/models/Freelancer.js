const mongoose = require('mongoose');

const freelancerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String }, // denormalized for easy access or retrieved via populate
  category: { type: String, required: true },
  skills: [{ type: String }],
  bio: { type: String },
  profileImage: { type: String, default: 'https://via.placeholder.com/150' },
  rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Freelancer', freelancerSchema);
