const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  skills: [{ type: String }],
  portfolioLinks: [{ type: String }],
  experience: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  hourlyRate: { type: Number, required: true },
  category: { type: String, required: true, lowercase: true },
  availability: { type: String, enum: ['online', 'offline'], default: 'online' }
}, { timestamps: true });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
