const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Optional reference
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'rejected'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid'], 
    default: 'pending' 
  },
  trackingId: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
