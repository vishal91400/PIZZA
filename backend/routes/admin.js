const express = require('express');
const { auth, requirePermission } = require('../middleware/auth');
const Pizza = require('../models/Pizza');
const Order = require('../models/Order');
const Admin = require('../models/Admin');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private
router.get('/dashboard', [
  auth,
  requirePermission('view_analytics')
], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todaysOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate('items.pizza');

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('items.pizza')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-__v');

    // Get pizza statistics
    const totalPizzas = await Pizza.countDocuments();
    const availablePizzas = await Pizza.countDocuments({ isAvailable: true });
    const popularPizzas = await Pizza.countDocuments({ isPopular: true });

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const preparingOrders = await Order.countDocuments({ status: 'Preparing' });
    const onTheWayOrders = await Order.countDocuments({ status: 'On The Way' });

    // Calculate revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const todaysRevenue = todaysOrders
      .filter(order => order.status === 'Delivered')
      .reduce((sum, order) => sum + order.total, 0);

    // Get popular pizzas
    const topPizzas = await Pizza.find({ isAvailable: true, isPopular: true })
      .sort({ name: 1 })
      .limit(5);

    // Get orders by status for chart
    const ordersByStatus = {
      pending: pendingOrders,
      preparing: preparingOrders,
      onTheWay: onTheWayOrders,
      delivered: await Order.countDocuments({ status: 'Delivered' }),
      cancelled: await Order.countDocuments({ status: 'Cancelled' })
    };

    // Get recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentActivity = await Order.find({
      createdAt: { $gte: lastWeek }
    })
      .sort({ createdAt: -1 })
      .populate('items.pizza')
      .select('orderNumber status total createdAt customer.name');

    const dashboardData = {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPizzas,
        availablePizzas
      },
      today: {
        orders: todaysOrders.length,
        revenue: todaysRevenue
      },
      orders: {
        pending: pendingOrders,
        preparing: preparingOrders,
        onTheWay: onTheWayOrders,
        byStatus: ordersByStatus
      },
      pizzas: {
        total: totalPizzas,
        available: availablePizzas,
        popular: popularPizzas,
        topPizzas
      },
      recentOrders,
      recentActivity
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private
router.get('/analytics', [
  auth,
  requirePermission('view_analytics')
], async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Orders over time
    const ordersOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Revenue over time
    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'Delivered'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$total" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top selling pizzas
    const topSellingPizzas = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.pizza",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" }
        }
      },
      {
        $lookup: {
          from: 'pizzas',
          localField: '_id',
          foreignField: '_id',
          as: 'pizza'
        }
      },
      {
        $unwind: "$pizza"
      },
      {
        $project: {
          name: "$pizza.name",
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$total" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgValue: { $avg: "$total" },
          minValue: { $min: "$total" },
          maxValue: { $max: "$total" }
        }
      }
    ]);

    const analytics = {
      period,
      ordersOverTime,
      revenueOverTime,
      topSellingPizzas,
      paymentMethods,
      averageOrderValue: avgOrderValue[0] || { avgValue: 0, minValue: 0, maxValue: 0 }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Server error while fetching analytics'
    });
  }
});

// @route   GET /api/admin/order-stats
// @desc    Get order statistics for analytics
// @access  Private
router.get('/order-stats', [
  auth,
  requirePermission('view_analytics')
], async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Total orders and revenue
    const totalStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Daily orders for chart
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top selling pizzas
    const topPizzas = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.pizza',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'pizzas',
          localField: '_id',
          foreignField: '_id',
          as: 'pizza'
        }
      },
      {
        $unwind: '$pizza'
      },
      {
        $project: {
          name: '$pizza.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = {
      period,
      summary: totalStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      ordersByStatus,
      dailyOrders,
      topPizzas
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

// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Private
router.get('/settings', [
  auth,
  requirePermission('manage_settings')
], async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');

    res.json({
      success: true,
      data: {
        admin,
        appSettings: {
          deliveryFee: 2.99,
          taxRate: 0.08,
          estimatedDeliveryTime: 30, // minutes
          maxOrderValue: 500,
          minOrderValue: 10
        }
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Server error while fetching settings'
    });
  }
});

// @route   POST /api/admin/initialize
// @desc    Initialize default admin and sample data
// @access  Public (only for first time setup)
router.post('/initialize', async (req, res) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({
        error: 'System already initialized'
      });
    }

    // Create default admin
    const defaultAdmin = await Admin.createDefaultAdmin();

    // Create default customer
    const Customer = require('../models/Customer');
    const defaultCustomer = await Customer.createDefaultCustomer();

    // Create default coupons
    const Coupon = require('../models/Coupon');
    await Coupon.createDefaultCoupons(defaultAdmin._id);

    // Create sample pizzas
    const samplePizzas = [
      {
        name: 'Margherita',
        description: 'Classic tomato sauce with mozzarella cheese and fresh basil',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&h=600&fit=crop',
        category: 'Veg',
        size: 'Medium',
        toppings: ['Tomato Sauce', 'Mozzarella', 'Basil'],
        isAvailable: true,
        isPopular: true,
        preparationTime: 15,
        calories: 285,
        spicyLevel: 1
      },
      {
        name: 'Pepperoni',
        description: 'Spicy pepperoni with melted cheese on crispy crust',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
        category: 'Non-Veg',
        size: 'Medium',
        toppings: ['Tomato Sauce', 'Mozzarella', 'Pepperoni'],
        isAvailable: true,
        isPopular: true,
        preparationTime: 18,
        calories: 320,
        spicyLevel: 3
      },
      {
        name: 'BBQ Chicken',
        description: 'BBQ sauce with grilled chicken, red onions, and cilantro',
        price: 17.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        category: 'Non-Veg',
        size: 'Medium',
        toppings: ['BBQ Sauce', 'Grilled Chicken', 'Red Onions', 'Cilantro'],
        isAvailable: true,
        isPopular: false,
        preparationTime: 20,
        calories: 350,
        spicyLevel: 2
      },
      {
        name: 'Veggie Supreme',
        description: 'Loaded with fresh vegetables and premium cheese',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
        category: 'Veg',
        size: 'Medium',
        toppings: ['Tomato Sauce', 'Mozzarella', 'Bell Peppers', 'Mushrooms', 'Olives', 'Onions'],
        isAvailable: true,
        isPopular: true,
        preparationTime: 22,
        calories: 280,
        spicyLevel: 1
      },
      {
        name: 'Hawaiian',
        description: 'Sweet pineapple with ham and melted cheese',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=600&fit=crop',
        category: 'Non-Veg',
        size: 'Medium',
        toppings: ['Tomato Sauce', 'Mozzarella', 'Ham', 'Pineapple'],
        isAvailable: true,
        isPopular: false,
        preparationTime: 19,
        calories: 310,
        spicyLevel: 1
      }
    ];

    await Pizza.insertMany(samplePizzas);

    res.json({
      success: true,
      message: 'System initialized successfully',
      data: {
        admin: {
          email: defaultAdmin.email,
          password: 'admin123'
        },
        customer: {
          email: defaultCustomer.email,
          password: 'customer123'
        },
        pizzasCreated: samplePizzas.length
      }
    });

  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).json({
      error: 'Server error while initializing system'
    });
  }
});

module.exports = router; 