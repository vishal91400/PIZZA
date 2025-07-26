const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const Coupon = require('../models/Coupon');
const { auth, requirePermission, requireAdmin } = require('../middleware/auth');
const { emitOrderCreated, emitOrderStatusUpdate } = require('../socket');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public
router.post('/', [
  body('customer.name').trim().isLength({ min: 2, max: 100 }).withMessage('Customer name must be between 2 and 100 characters'),
  body('customer.phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('customer.email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('customer.address.street').trim().isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
  body('customer.address.city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
  body('customer.address.state').trim().isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),
  body('customer.address.zipCode').trim().isLength({ min: 3, max: 10 }).withMessage('ZIP code must be between 3 and 10 characters'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.pizza').isMongoId().withMessage('Valid pizza ID is required'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),
  body('paymentMethod').optional().isIn(['Cash on Delivery', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Razorpay']).withMessage('Invalid payment method'),
  body('couponCode').optional().trim().isLength({ max: 20 }).withMessage('Coupon code cannot exceed 20 characters')
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

    const { customer, items, paymentMethod = 'Cash on Delivery', specialInstructions, couponCode } = req.body;

    // Validate and populate pizza details
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const pizza = await Pizza.findById(item.pizza);
      if (!pizza) {
        return res.status(400).json({
          success: false,
          error: `Pizza with ID ${item.pizza} not found`
        });
      }

      if (!pizza.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `Pizza ${pizza.name} is currently unavailable`
        });
      }

      const itemTotal = pizza.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        pizza: pizza._id,
        name: pizza.name,
        price: pizza.price,
        quantity: item.quantity,
        totalPrice: itemTotal
      });
    }

    // Handle coupon if provided
    let coupon = null;
    let discount = 0;

    if (couponCode) {
      coupon = await Coupon.findValidByCode(couponCode);
      if (coupon) {
        // Prepare order data for validation
        const orderData = {
          subtotal,
          items: orderItems.map(item => ({
            pizza: {
              category: item.pizza.category,
              _id: item.pizza._id
            }
          }))
        };

        const validation = coupon.validateForOrder(orderData);
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          // Increment coupon usage
          await coupon.incrementUsage();
        } else {
          return res.status(400).json({
            success: false,
            error: validation.error
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired coupon code'
        });
      }
    }

    // Calculate totals
    const deliveryFee = 2.99;
    const finalSubtotal = subtotal - discount;
    const tax = finalSubtotal * 0.08; // 8% tax on discounted amount
    const total = finalSubtotal + deliveryFee + tax;

    // Generate order number
    const orderNumber = 'PIZ' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Set estimated delivery time (30 minutes from now)
    const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

    // Create order data
    const orderData = {
      orderNumber,
      customer,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod,
      specialInstructions,
      estimatedDeliveryTime,
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    };

    // Add coupon information if applicable
    if (coupon) {
      orderData.coupon = {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        discount
      };
    }

    // Create order
    const order = new Order(orderData);
    await order.save();

    // Emit Socket.IO event for new order
    emitOrderCreated(order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        subtotal: order.subtotal,
        discount: order.coupon?.discount || 0,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        total: order.total,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        status: order.status,
        coupon: order.coupon ? {
          code: order.coupon.code,
          name: order.coupon.name,
          discount: order.coupon.discount
        } : null
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating order'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.pizza')
      .select('-__v');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        error: 'Order not found'
      });
    }
    res.status(500).json({
      error: 'Server error while fetching order'
    });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number (public)
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.pizza')
      .select('-__v');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      error: 'Server error while tracking order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/:id/status', [
  auth,
  requireAdmin,
  body('status').isIn(['Pending', 'Preparing', 'On The Way', 'Delivered', 'Cancelled']).withMessage('Invalid status'),
  body('note').optional().trim().isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
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

    const { status, note } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update status
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`
    });

    // Update delivery times based on status
    if (status === 'On The Way') {
      order.estimatedDeliveryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    } else if (status === 'Delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Emit Socket.IO event for status update
    emitOrderStatusUpdate(orderId, {
      status: order.status,
      paymentStatus: order.paymentStatus,
      estimatedDeliveryTime: order.estimatedDeliveryTime
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order status'
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private
router.get('/', [
  auth,
  requirePermission('manage_orders')
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.pizza')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics (admin only)
// @access  Private
router.get('/stats/summary', [
  auth,
  requirePermission('view_analytics')
], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todaysOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Orders by status
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const preparingOrders = await Order.countDocuments({ status: 'Preparing' });
    const onTheWayOrders = await Order.countDocuments({ status: 'On The Way' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    // Revenue calculations
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const todaysRevenue = todaysOrders
      .filter(order => order.status === 'Delivered')
      .reduce((sum, order) => sum + order.total, 0);

    const stats = {
      today: {
        orders: todaysOrders.length,
        revenue: todaysRevenue
      },
      total: {
        orders: totalOrders,
        revenue: totalRevenue[0]?.total || 0
      },
      byStatus: {
        pending: pendingOrders,
        preparing: preparingOrders,
        onTheWay: onTheWayOrders,
        delivered: deliveredOrders
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching order statistics'
    });
  }
});

module.exports = router; 