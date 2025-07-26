const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pizza name is required'],
    trim: true,
    maxlength: [100, 'Pizza name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Pizza description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Pizza price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Pizza image is required']
  },
  category: {
    type: String,
    required: [true, 'Pizza category is required'],
    enum: ['Veg', 'Non-Veg', 'Vegan'],
    default: 'Veg'
  },
  size: {
    type: String,
    required: [true, 'Pizza size is required'],
    enum: ['Small', 'Medium', 'Large', 'Extra Large'],
    default: 'Medium'
  },
  toppings: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 20, // minutes
    min: [5, 'Preparation time must be at least 5 minutes']
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  spicyLevel: {
    type: Number,
    min: [0, 'Spicy level cannot be negative'],
    max: [5, 'Spicy level cannot exceed 5'],
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
pizzaSchema.virtual('formattedPrice').get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Index for better query performance
pizzaSchema.index({ name: 'text', description: 'text' });
pizzaSchema.index({ category: 1, isAvailable: 1 });
pizzaSchema.index({ isPopular: 1, isAvailable: 1 });

// Pre-save middleware to ensure price is positive
pizzaSchema.pre('save', function (next) {
  if (this.price < 0) {
    next(new Error('Price cannot be negative'));
  }
  next();
});

// Static method to get available pizzas
pizzaSchema.statics.getAvailablePizzas = function () {
  return this.find({ isAvailable: true }).sort({ isPopular: -1, name: 1 });
};

// Static method to get popular pizzas
pizzaSchema.statics.getPopularPizzas = function () {
  return this.find({ isAvailable: true, isPopular: true }).sort({ name: 1 });
};

// Instance method to toggle availability
pizzaSchema.methods.toggleAvailability = function () {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

module.exports = mongoose.model('Pizza', pizzaSchema); 