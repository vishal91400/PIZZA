const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  pizza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        trim: true
      },
      deliveryInstructions: {
        type: String,
        trim: true,
        maxlength: [200, 'Delivery instructions cannot exceed 200 characters']
      }
    }
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    default: 2.99,
    min: [0, 'Delivery fee cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'On The Way', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Razorpay'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    transactionId: String,
    paymentDate: Date
  },
  coupon: {
    code: String,
    name: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: Number,
    discount: Number
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'On The Way', 'Delivered', 'Cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    }
  }],
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [300, 'Special instructions cannot exceed 300 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function () {
  return `$${this.total.toFixed(2)}`;
});

// Virtual for order duration
orderSchema.virtual('orderDuration').get(function () {
  if (this.actualDeliveryTime) {
    return Math.round((this.actualDeliveryTime - this.createdAt) / (1000 * 60)); // minutes
  }
  return null;
});

// Index for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number and calculate totals
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    // Generate order number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `PZ${timestamp}${random}`;

    // Calculate totals
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.tax = this.subtotal * 0.08; // 8% tax
    this.total = this.subtotal + this.deliveryFee + this.tax;

    // Set estimated delivery time (30 minutes from now)
    this.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

    // Initialize status history
    this.statusHistory = [{
      status: 'Pending',
      timestamp: new Date(),
      note: 'Order placed successfully'
    }];
  }

  // Update status history when status changes
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }

  next();
});

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function (status) {
  return this.find({ status }).populate('items.pizza').sort({ createdAt: -1 });
};

// Static method to get today's orders
orderSchema.statics.getTodaysOrders = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  }).populate('items.pizza').sort({ createdAt: -1 });
};

// Instance method to update status
orderSchema.methods.updateStatus = function (newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });

  if (newStatus === 'Delivered') {
    this.actualDeliveryTime = new Date();
  }

  return this.save();
};

module.exports = mongoose.model('Order', orderSchema); 