const mongoose = require('mongoose');

const clientProjectSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  predictedCategory: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ClientProject', clientProjectSchema);
