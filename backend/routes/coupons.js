const express = require('express');
const { body, validationResult } = require('express-validator');
const Coupon = require('../models/Coupon');
const { auth, requireAdmin, requireCustomer } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('subtotal').isNumeric().withMessage('Valid subtotal is required'),
  body('items').isArray().withMessage('Items array is required')
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

    const { code, subtotal, items } = req.body;

    // Find coupon by code
    const coupon = await Coupon.findValidByCode(code);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired coupon code'
      });
    }

    // Prepare order data for validation
    const orderData = {
      subtotal: parseFloat(subtotal),
      items: items.map(item => ({
        pizza: {
          category: item.pizza.category,
          _id: item.pizza._id
        }
      }))
    };

    // Validate coupon for this order
    const validation = coupon.validateForOrder(orderData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(orderData.subtotal);
    const finalSubtotal = orderData.subtotal - discount;

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          id: coupon._id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          formattedValue: coupon.formattedValue,
          minOrderAmount: coupon.minOrderAmount,
          maxDiscount: coupon.maxDiscount
        },
        discount,
        subtotal: orderData.subtotal,
        finalSubtotal
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while validating coupon'
    });
  }
});

// @route   GET /api/coupons
// @desc    Get all coupons (admin)
// @access  Private (Admin)
router.get('/', [
  auth,
  requireAdmin
], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.validUntil = { $lt: new Date() };
    }

    // Search by code or name
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCoupons: total,
          hasNextPage: skip + coupons.length < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching coupons'
    });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon (admin)
// @access  Private (Admin)
router.post('/', [
  auth,
  requireAdmin,
  body('code').trim().isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3 and 20 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Coupon name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Invalid coupon type'),
  body('value').isNumeric().withMessage('Valid value is required'),
  body('minOrderAmount').optional().isNumeric().withMessage('Valid minimum order amount is required'),
  body('maxDiscount').optional().isNumeric().withMessage('Valid maximum discount is required'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
  body('userUsageLimit').optional().isInt({ min: 1 }).withMessage('User usage limit must be at least 1'),
  body('applicableCategories').optional().isArray().withMessage('Applicable categories must be an array'),
  body('applicablePizzas').optional().isArray().withMessage('Applicable pizzas must be an array'),
  body('excludedPizzas').optional().isArray().withMessage('Excluded pizzas must be an array'),
  body('firstTimeOnly').optional().isBoolean().withMessage('First time only must be a boolean')
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

    const couponData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code already exists'
      });
    }

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating coupon'
    });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update a coupon (admin)
// @access  Private (Admin)
router.put('/:id', [
  auth,
  requireAdmin,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Coupon name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('value').optional().isNumeric().withMessage('Valid value is required'),
  body('minOrderAmount').optional().isNumeric().withMessage('Valid minimum order amount is required'),
  body('maxDiscount').optional().isNumeric().withMessage('Valid maximum discount is required'),
  body('validFrom').optional().isISO8601().withMessage('Valid from date is required'),
  body('validUntil').optional().isISO8601().withMessage('Valid until date is required'),
  body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
  body('userUsageLimit').optional().isInt({ min: 1 }).withMessage('User usage limit must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('Is active must be a boolean')
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

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    // Update coupon
    Object.assign(coupon, req.body);
    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating coupon'
    });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon (admin)
// @access  Private (Admin)
router.delete('/:id', [
  auth,
  requireAdmin
], async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting coupon'
    });
  }
});

// @route   GET /api/coupons/:id
// @desc    Get coupon details (admin)
// @access  Private (Admin)
router.get('/:id', [
  auth,
  requireAdmin
], async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('applicablePizzas', 'name')
      .populate('excludedPizzas', 'name');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching coupon'
    });
  }
});

// @route   POST /api/coupons/:id/toggle
// @desc    Toggle coupon active status (admin)
// @access  Private (Admin)
router.post('/:id/toggle', [
  auth,
  requireAdmin
], async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: coupon._id,
        isActive: coupon.isActive
      }
    });

  } catch (error) {
    console.error('Toggle coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while toggling coupon'
    });
  }
});

// @route   GET /api/coupons/stats/overview
// @desc    Get coupon statistics (admin)
// @access  Private (Admin)
router.get('/stats/overview', [
  auth,
  requireAdmin
], async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ validUntil: { $lt: new Date() } });
    const totalUsage = await Coupon.aggregate([
      { $group: { _id: null, totalUsage: { $sum: '$usedCount' } } }
    ]);

    const recentCoupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('code name usedCount isActive validUntil');

    res.json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsage: totalUsage[0]?.totalUsage || 0,
        recentCoupons
      }
    });

  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching coupon statistics'
    });
  }
});

module.exports = router; 