const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/customer/register
// @desc    Register a new customer
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('address').optional().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('city').optional().isLength({ max: 50 }).withMessage('City cannot exceed 50 characters'),
  body('state').optional().isLength({ max: 50 }).withMessage('State cannot exceed 50 characters'),
  body('zipCode').optional().isLength({ max: 10 }).withMessage('ZIP code cannot exceed 10 characters')
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

    const { name, email, phone, password, address, city, state, zipCode } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findByEmail(email);
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists'
      });
    }

    // Create customer data
    const customerData = {
      name,
      email,
      phone,
      password
    };

    // Add address if provided
    if (address && city && state && zipCode) {
      customerData.addresses = [{
        name: 'Home',
        type: 'Home',
        address,
        city,
        state,
        zipCode,
        isDefault: true
      }];
    }

    // Create customer
    const customer = await Customer.create(customerData);

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await customer.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          addresses: customer.addresses,
          loyaltyPoints: customer.loyaltyPoints,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          tier: customer.tier
        },
        token
      }
    });

  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @route   POST /api/customer/login
// @desc    Customer login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find customer by email
    const customer = await Customer.findByEmail(email);
    if (!customer) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (customer.lockUntil && customer.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Check if account is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      await customer.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await customer.resetLoginAttempts();
    await customer.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          addresses: customer.addresses,
          loyaltyPoints: customer.loyaltyPoints,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          tier: customer.tier,
          preferences: customer.preferences
        },
        token
      }
    });

  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @route   GET /api/customer/profile
// @desc    Get customer profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id)
      .select('-password -loginAttempts -lockUntil');

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/customer/profile
// @desc    Update customer profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number')
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

    const { name, phone, preferences } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Update fields
    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (preferences) {
      customer.preferences = { ...customer.preferences, ...preferences };
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
        loyaltyPoints: customer.loyaltyPoints,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        tier: customer.tier,
        preferences: customer.preferences
      }
    });

  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/customer/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', [
  auth,
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Address name is required'),
  body('type').isIn(['Home', 'Work', 'Other']).withMessage('Invalid address type'),
  body('address').trim().isLength({ min: 1, max: 200 }).withMessage('Address is required'),
  body('city').trim().isLength({ min: 1, max: 50 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 1, max: 50 }).withMessage('State is required'),
  body('zipCode').trim().isLength({ min: 1, max: 10 }).withMessage('ZIP code is required'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
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

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    await customer.addAddress(req.body);

    res.json({
      success: true,
      message: 'Address added successfully',
      data: customer.addresses
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding address'
    });
  }
});

// @route   PUT /api/customer/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', [
  auth,
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Address name is required'),
  body('type').optional().isIn(['Home', 'Work', 'Other']).withMessage('Invalid address type'),
  body('address').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Address is required'),
  body('city').optional().trim().isLength({ min: 1, max: 50 }).withMessage('City is required'),
  body('state').optional().trim().isLength({ min: 1, max: 50 }).withMessage('State is required'),
  body('zipCode').optional().trim().isLength({ min: 1, max: 10 }).withMessage('ZIP code is required'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
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

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    await customer.updateAddress(req.params.addressId, req.body);

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: customer.addresses
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating address'
    });
  }
});

// @route   DELETE /api/customer/addresses/:addressId
// @desc    Remove address
// @access  Private
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    await customer.removeAddress(req.params.addressId);

    res.json({
      success: true,
      message: 'Address removed successfully',
      data: customer.addresses
    });

  } catch (error) {
    console.error('Remove address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing address'
    });
  }
});

// @route   GET /api/customer/orders
// @desc    Get customer order history
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const Order = require('../models/Order');
    let query = { 'customer.id': req.user.id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.pizza')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: skip + orders.length < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
});

// @route   POST /api/customer/reorder/:orderId
// @desc    Reorder from previous order
// @access  Private
router.post('/reorder/:orderId', auth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Pizza = require('../models/Pizza');

    const originalOrder = await Order.findById(req.params.orderId)
      .populate('items.pizza');

    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify customer owns this order
    if (originalOrder.customer.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if pizzas are still available
    const reorderItems = [];
    for (const item of originalOrder.items) {
      const pizza = await Pizza.findById(item.pizza._id);
      if (pizza && pizza.isAvailable) {
        reorderItems.push({
          pizza: item.pizza._id,
          quantity: item.quantity,
          price: pizza.price,
          totalPrice: pizza.price * item.quantity
        });
      }
    }

    if (reorderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No items from this order are currently available'
      });
    }

    // Calculate totals
    const subtotal = reorderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    res.json({
      success: true,
      message: 'Reorder items prepared',
      data: {
        items: reorderItems,
        subtotal,
        deliveryFee,
        tax,
        total,
        originalOrderId: originalOrder._id
      }
    });

  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing reorder'
    });
  }
});

// @route   POST /api/customer/logout
// @desc    Customer logout
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Customer logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
});

module.exports = router; 