const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth, requireCustomer, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private (Customer)
router.post('/create-order', [
  auth,
  requireCustomer,
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { orderId, amount } = req.body;

    // Verify order exists and belongs to customer
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.customer.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerId: req.user.id
      }
    });

    // Update order with Razorpay order ID
    order.paymentDetails.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = 'Razorpay';
    await order.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating payment order'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment signature
// @access  Private (Customer)
router.post('/verify', [
  auth,
  requireCustomer,
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Find order by Razorpay order ID
    const order = await Order.findOne({
      'paymentDetails.razorpayOrderId': razorpayOrderId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify order belongs to customer
    if (order.customer.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update order payment details
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.paymentDetails.transactionId = razorpayPaymentId;
    order.paymentDetails.paymentDate = new Date();
    order.paymentStatus = 'Paid';
    order.status = 'Preparing'; // Move to next status after payment

    // Add status history entry
    order.statusHistory.push({
      status: 'Preparing',
      timestamp: new Date(),
      note: 'Payment received, order confirmed'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        transactionId: razorpayPaymentId
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while verifying payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

// Handle payment captured
const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({
      'paymentDetails.razorpayOrderId': payment.order_id
    });

    if (order && order.paymentStatus !== 'Paid') {
      order.paymentDetails.razorpayPaymentId = payment.id;
      order.paymentDetails.transactionId = payment.id;
      order.paymentDetails.paymentDate = new Date();
      order.paymentStatus = 'Paid';
      order.status = 'Preparing';

      order.statusHistory.push({
        status: 'Preparing',
        timestamp: new Date(),
        note: 'Payment confirmed via webhook'
      });

      await order.save();
      console.log(`Payment confirmed for order: ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
};

// Handle payment failed
const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({
      'paymentDetails.razorpayOrderId': payment.order_id
    });

    if (order) {
      order.paymentStatus = 'Failed';
      order.status = 'Cancelled';

      order.statusHistory.push({
        status: 'Cancelled',
        timestamp: new Date(),
        note: 'Payment failed'
      });

      await order.save();
      console.log(`Payment failed for order: ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
};

// Handle refund processed
const handleRefundProcessed = async (refund) => {
  try {
    const order = await Order.findOne({
      'paymentDetails.razorpayPaymentId': refund.payment_id
    });

    if (order) {
      order.paymentStatus = 'Refunded';
      order.statusHistory.push({
        status: order.status,
        timestamp: new Date(),
        note: `Refund processed: ${refund.id}`
      });

      await order.save();
      console.log(`Refund processed for order: ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Handle refund processed error:', error);
  }
};

// @route   POST /api/payments/refund
// @desc    Process refund for an order
// @access  Private (Admin)
router.post('/refund', [
  auth,
  requireAdmin,
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('amount').optional().isNumeric().withMessage('Valid amount is required'),
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        error: 'Order is not paid'
      });
    }

    if (!order.paymentDetails.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        error: 'No payment found for this order'
      });
    }

    // Process refund through Razorpay
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.total * 100);

    const refund = await razorpay.payments.refund(
      order.paymentDetails.razorpayPaymentId,
      {
        amount: refundAmount,
        notes: {
          reason: reason || 'Customer request',
          orderId: order._id.toString()
        }
      }
    );

    // Update order
    order.paymentStatus = 'Refunded';
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: `Refund processed: ${refund.id} - ${reason || 'Customer request'}`
    });

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        orderId: order._id
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing refund'
    });
  }
});

module.exports = router; 