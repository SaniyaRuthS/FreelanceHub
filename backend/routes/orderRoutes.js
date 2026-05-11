const express = require('express');
const router = express.Router();
const { createOrder, getOrderByTrackingId, updateOrderStatus, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, getUserOrders);

router.route('/:id')
    .put(protect, updateOrderStatus);

router.route('/track/:trackingId')
    .get(protect, getOrderByTrackingId);

module.exports = router;
