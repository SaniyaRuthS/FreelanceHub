const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'FreelancerProfile', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  images: [{ type: String }],
  demoUrl: { type: String },
  demoAvailable: { type: Boolean, default: false }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Project', projectSchema);
