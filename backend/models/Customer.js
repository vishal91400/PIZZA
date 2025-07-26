const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Address name is required'],
    trim: true,
    maxlength: [50, 'Address name cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home'
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    maxlength: [10, 'ZIP code cannot exceed 10 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
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
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  addresses: [addressSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
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
  preferences: {
    favoritePizzas: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza'
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free']
    }],
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Hot'],
      default: 'Medium'
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted total spent
customerSchema.virtual('formattedTotalSpent').get(function () {
  return `$${this.totalSpent.toFixed(2)}`;
});

// Virtual for customer tier
customerSchema.virtual('tier').get(function () {
  if (this.totalSpent >= 500) return 'Gold';
  if (this.totalSpent >= 200) return 'Silver';
  return 'Bronze';
});

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to ensure only one default address
customerSchema.pre('save', function (next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      this.addresses.forEach((addr, index) => {
        if (index > 0) addr.isDefault = false;
      });
    }
  }
  next();
});

// Instance method to compare password
customerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
customerSchema.methods.incLoginAttempts = function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Lock for 2 hours
  }
  return this.save();
};

// Instance method to reset login attempts
customerSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Instance method to update last login
customerSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to add address
customerSchema.methods.addAddress = function (addressData) {
  if (addressData.isDefault) {
    // Remove default from other addresses
    this.addresses.forEach(addr => addr.isDefault = false);
  }
  this.addresses.push(addressData);
  return this.save();
};

// Instance method to update address
customerSchema.methods.updateAddress = function (addressId, addressData) {
  const addressIndex = this.addresses.findIndex(addr => addr._id.toString() === addressId);
  if (addressIndex === -1) throw new Error('Address not found');

  if (addressData.isDefault) {
    // Remove default from other addresses
    this.addresses.forEach(addr => addr.isDefault = false);
  }

  this.addresses[addressIndex] = { ...this.addresses[addressIndex], ...addressData };
  return this.save();
};

// Instance method to remove address
customerSchema.methods.removeAddress = function (addressId) {
  this.addresses = this.addresses.filter(addr => addr._id.toString() !== addressId);
  return this.save();
};

// Instance method to add favorite pizza
customerSchema.methods.addFavoritePizza = function (pizzaId) {
  if (!this.preferences.favoritePizzas.includes(pizzaId)) {
    this.preferences.favoritePizzas.push(pizzaId);
  }
  return this.save();
};

// Instance method to remove favorite pizza
customerSchema.methods.removeFavoritePizza = function (pizzaId) {
  this.preferences.favoritePizzas = this.preferences.favoritePizzas.filter(
    id => id.toString() !== pizzaId
  );
  return this.save();
};

// Static method to find by email
customerSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to create default customer (for testing)
customerSchema.statics.createDefaultCustomer = async function () {
  const existingCustomer = await this.findOne({ email: 'customer@pizza.com' });
  if (existingCustomer) return existingCustomer;

  return await this.create({
    name: 'John Customer',
    email: 'customer@pizza.com',
    phone: '+1234567890',
    password: 'customer123',
    addresses: [{
      name: 'Home',
      type: 'Home',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isDefault: true
    }],
    isVerified: true
  });
};

module.exports = mongoose.model('Customer', customerSchema); 