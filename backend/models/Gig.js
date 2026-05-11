const mongoose = require('mongoose');

const gigPackageSchema = new mongoose.Schema({
  type: { type: String, enum: ['Basic', 'Standard', 'Premium'], required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  deliveryTime: { type: Number, required: true }, // in days
  features: [{ type: String }]
});

const gigSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Alias for sellerId
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  price: { type: Number }, // Unified price field (for buyer gigs)
  role: { type: String, enum: ['buyer', 'seller'], default: 'seller' },
  projectLink: { type: String },
  images: [{ type: String }],
  tags: [{ type: String }],
  packages: [gigPackageSchema],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'draft'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);
