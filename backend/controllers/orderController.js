const Order = require('../models/Order');

// @desc    Create a new order (Client initiates)
// @route   POST /api/orders
// @access  Private (Client)
const createOrder = async (req, res) => {
  try {
    // Ensure only users with role "client" (or standard "user") can create orders
    if (req.user.role === 'freelancer') {
      return res.status(403).json({ message: 'Only clients can create project orders.' });
    }

    const { freelancerId, title, description, amount, projectId } = req.body;
    
    // Generate a simple 8-character alphanumeric tracking ID
    const trackingId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const order = await Order.create({
      clientId: req.user._id,
      freelancerId,
      projectId: projectId || undefined,
      title,
      description,
      amount: amount || 0,
      trackingId
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by Tracking ID
// @route   GET /api/orders/track/:trackingId
// @access  Private
const getOrderByTrackingId = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId })
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role validation: Only the specific client or freelancer can view this order
    const isClient = order.clientId._id.toString() === req.user._id.toString();
    const isFreelancer = order.freelancerId._id.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Freelancer/Client)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isClient = order.clientId.toString() === req.user._id.toString();
    const isFreelancer = order.freelancerId.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Usually freelancer updates the timeline status, you could add tighter role validation here
    if (status) {
       if ((status === 'accepted' || status === 'rejected') && !isFreelancer) {
         return res.status(403).json({ message: 'Only the freelancer can Accept or Reject this request.' });
       }
       order.status = status;
    }
    if (paymentStatus) {
       // Only client can process their own payment
       if (paymentStatus === 'paid' && !isClient) {
         return res.status(403).json({ message: 'Only the client can finalize payments.' });
       }
       order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    // Find where the user is either the client or the freelancer
    const orders = await Order.find({
      $or: [{ clientId: req.user._id }, { freelancerId: req.user._id }]
    })
    .populate('clientId', 'name email')
    .populate('freelancerId', 'name email')
    .sort('-createdAt');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrderByTrackingId, updateOrderStatus, getUserOrders };
