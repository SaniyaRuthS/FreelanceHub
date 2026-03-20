const mongoose = require('mongoose');

const demoProjectSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  demoLink: { type: String }
});

module.exports = mongoose.model('DemoProject', demoProjectSchema);
