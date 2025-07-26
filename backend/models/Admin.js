const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  profileImage: {
    type: String
  },
  phone: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    enum: [
      'manage_pizzas',
      'manage_orders',
      'view_analytics',
      'manage_admins',
      'manage_settings'
    ]
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if account is locked
adminSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set default permissions
adminSchema.pre('save', function (next) {
  if (this.isNew && this.permissions.length === 0) {
    this.permissions = [
      'manage_pizzas',
      'manage_orders',
      'view_analytics'
    ];
  }
  next();
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to update last login
adminSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find admin by email
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to create default admin
adminSchema.statics.createDefaultAdmin = async function () {
  const defaultAdmin = await this.findOne({ email: 'admin@pizza.com' });

  if (!defaultAdmin) {
    return this.create({
      name: 'Admin',
      email: 'admin@pizza.com',
      password: 'admin123',
      role: 'super_admin',
      permissions: [
        'manage_pizzas',
        'manage_orders',
        'view_analytics',
        'manage_admins',
        'manage_settings'
      ]
    });
  }

  return defaultAdmin;
};

module.exports = mongoose.model('Admin', adminSchema); 