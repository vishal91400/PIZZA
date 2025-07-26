const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Coupon value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    default: 1,
    min: [1, 'User usage limit must be at least 1']
  },
  applicableCategories: [{
    type: String,
    enum: ['Veg', 'Non-Veg', 'Vegan']
  }],
  applicablePizzas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza'
  }],
  excludedPizzas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza'
  }],
  firstTimeOnly: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining usage
couponSchema.virtual('remainingUsage').get(function () {
  if (!this.usageLimit) return null;
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for is expired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.validUntil;
});

// Virtual for is valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  return this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Virtual for formatted value
couponSchema.virtual('formattedValue').get(function () {
  if (this.type === 'percentage') {
    return `${this.value}%`;
  }
  return `$${this.value.toFixed(2)}`;
});

// Indexes for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1, validUntil: 1 });

// Pre-save middleware to validate dates
couponSchema.pre('save', function (next) {
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid from date must be before valid until date'));
  }
  next();
});

// Static method to find valid coupon by code
couponSchema.statics.findValidByCode = function (code) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ]
  });
};

// Instance method to validate coupon for order
couponSchema.methods.validateForOrder = function (orderData, customerId = null) {
  const now = new Date();

  // Check if coupon is active and valid
  if (!this.isActive) {
    return { valid: false, error: 'Coupon is inactive' };
  }

  if (now < this.validFrom || now > this.validUntil) {
    return { valid: false, error: 'Coupon is expired or not yet valid' };
  }

  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, error: 'Coupon usage limit exceeded' };
  }

  // Check minimum order amount
  if (orderData.subtotal < this.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of $${this.minOrderAmount.toFixed(2)} required`
    };
  }

  // Check applicable categories
  if (this.applicableCategories.length > 0) {
    const orderCategories = orderData.items.map(item => item.pizza.category);
    const hasValidCategory = orderCategories.some(category =>
      this.applicableCategories.includes(category)
    );
    if (!hasValidCategory) {
      return { valid: false, error: 'Coupon not applicable to items in cart' };
    }
  }

  // Check applicable pizzas
  if (this.applicablePizzas.length > 0) {
    const orderPizzaIds = orderData.items.map(item => item.pizza.toString());
    const hasValidPizza = orderPizzaIds.some(pizzaId =>
      this.applicablePizzas.some(applicableId => applicableId.toString() === pizzaId)
    );
    if (!hasValidPizza) {
      return { valid: false, error: 'Coupon not applicable to items in cart' };
    }
  }

  // Check excluded pizzas
  if (this.excludedPizzas.length > 0) {
    const orderPizzaIds = orderData.items.map(item => item.pizza.toString());
    const hasExcludedPizza = orderPizzaIds.some(pizzaId =>
      this.excludedPizzas.some(excludedId => excludedId.toString() === pizzaId)
    );
    if (hasExcludedPizza) {
      return { valid: false, error: 'Coupon not applicable to some items in cart' };
    }
  }

  return { valid: true };
};

// Instance method to calculate discount
couponSchema.methods.calculateDiscount = function (subtotal) {
  let discount = 0;

  if (this.type === 'percentage') {
    discount = (subtotal * this.value) / 100;
  } else {
    discount = this.value;
  }

  // Apply maximum discount limit
  if (this.maxDiscount) {
    discount = Math.min(discount, this.maxDiscount);
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Instance method to increment usage
couponSchema.methods.incrementUsage = function () {
  this.usedCount += 1;
  return this.save();
};

// Static method to create default coupons
couponSchema.statics.createDefaultCoupons = async function (adminId) {
  const defaultCoupons = [
    {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: 'Get 10% off on your first order',
      type: 'percentage',
      value: 10,
      minOrderAmount: 20,
      maxDiscount: 10,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      usageLimit: 1000,
      firstTimeOnly: true,
      createdBy: adminId
    },
    {
      code: 'SAVE5',
      name: 'Save $5',
      description: 'Save $5 on orders over $30',
      type: 'fixed',
      value: 5,
      minOrderAmount: 30,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      usageLimit: 500,
      createdBy: adminId
    },
    {
      code: 'VEG20',
      name: 'Vegetarian Special',
      description: '20% off on vegetarian pizzas',
      type: 'percentage',
      value: 20,
      minOrderAmount: 15,
      maxDiscount: 15,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      usageLimit: 200,
      applicableCategories: ['Veg'],
      createdBy: adminId
    }
  ];

  for (const couponData of defaultCoupons) {
    const existingCoupon = await this.findOne({ code: couponData.code });
    if (!existingCoupon) {
      await this.create(couponData);
    }
  }
};

module.exports = mongoose.model('Coupon', couponSchema); 