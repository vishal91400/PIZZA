const express = require('express');
const { body, validationResult } = require('express-validator');
const Pizza = require('../models/Pizza');
const { auth, requirePermission } = require('../middleware/auth');
const { upload, deleteImage, getPublicIdFromUrl } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/pizzas
// @desc    Get all available pizzas (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, popular } = req.query;
    let query = { isAvailable: true };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter popular pizzas
    if (popular === 'true') {
      query.isPopular = true;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const pizzas = await Pizza.find(query)
      .sort({ isPopular: -1, name: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: pizzas.length,
      data: pizzas
    });

  } catch (error) {
    console.error('Get pizzas error:', error);
    res.status(500).json({
      error: 'Server error while fetching pizzas'
    });
  }
});

// @route   GET /api/pizzas/:id
// @desc    Get single pizza by ID (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id).select('-__v');

    if (!pizza) {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }

    res.json({
      success: true,
      data: pizza
    });

  } catch (error) {
    console.error('Get pizza error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }
    res.status(500).json({
      error: 'Server error while fetching pizza'
    });
  }
});

// @route   POST /api/pizzas
// @desc    Create new pizza (admin only)
// @access  Private
router.post('/', [
  auth,
  requirePermission('manage_pizzas'),
  upload.single('image'),
  body('name', 'Pizza name is required').notEmpty().trim(),
  body('description', 'Pizza description is required').notEmpty().trim(),
  body('price', 'Price must be a positive number').isFloat({ min: 0 }),
  body('category', 'Category must be Veg, Non-Veg, or Vegan').isIn(['Veg', 'Non-Veg', 'Vegan']),
  body('size', 'Size must be Small, Medium, Large, or Extra Large').isIn(['Small', 'Medium', 'Large', 'Extra Large'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'Pizza image is required'
      });
    }

    const pizzaData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      image: req.file.path,
      category: req.body.category,
      size: req.body.size,
      toppings: req.body.toppings ? req.body.toppings.split(',').map(t => t.trim()) : [],
      isAvailable: req.body.isAvailable !== 'false',
      isPopular: req.body.isPopular === 'true',
      preparationTime: parseInt(req.body.preparationTime) || 20,
      calories: req.body.calories ? parseInt(req.body.calories) : undefined,
      spicyLevel: req.body.spicyLevel ? parseInt(req.body.spicyLevel) : 1
    };

    const pizza = await Pizza.create(pizzaData);

    res.status(201).json({
      success: true,
      message: 'Pizza created successfully',
      data: pizza
    });

  } catch (error) {
    console.error('Create pizza error:', error);

    // Delete uploaded image if pizza creation fails
    if (req.file) {
      await deleteImage(getPublicIdFromUrl(req.file.path));
    }

    res.status(500).json({
      error: 'Server error while creating pizza'
    });
  }
});

// @route   PUT /api/pizzas/:id
// @desc    Update pizza (admin only)
// @access  Private
router.put('/:id', [
  auth,
  requirePermission('manage_pizzas'),
  upload.single('image'),
  body('name', 'Pizza name is required').notEmpty().trim(),
  body('description', 'Pizza description is required').notEmpty().trim(),
  body('price', 'Price must be a positive number').isFloat({ min: 0 }),
  body('category', 'Category must be Veg, Non-Veg, or Vegan').isIn(['Veg', 'Non-Veg', 'Vegan']),
  body('size', 'Size must be Small, Medium, Large, or Extra Large').isIn(['Small', 'Medium', 'Large', 'Extra Large'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg
      });
    }

    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      size: req.body.size,
      toppings: req.body.toppings ? req.body.toppings.split(',').map(t => t.trim()) : [],
      isAvailable: req.body.isAvailable !== 'false',
      isPopular: req.body.isPopular === 'true',
      preparationTime: parseInt(req.body.preparationTime) || 20,
      calories: req.body.calories ? parseInt(req.body.calories) : undefined,
      spicyLevel: req.body.spicyLevel ? parseInt(req.body.spicyLevel) : 1
    };

    // Handle image update
    if (req.file) {
      // Delete old image
      if (pizza.image) {
        await deleteImage(getPublicIdFromUrl(pizza.image));
      }
      updateData.image = req.file.path;
    }

    const updatedPizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pizza updated successfully',
      data: updatedPizza
    });

  } catch (error) {
    console.error('Update pizza error:', error);

    // Delete uploaded image if update fails
    if (req.file) {
      await deleteImage(getPublicIdFromUrl(req.file.path));
    }

    if (error.name === 'CastError') {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }
    res.status(500).json({
      error: 'Server error while updating pizza'
    });
  }
});

// @route   DELETE /api/pizzas/:id
// @desc    Delete pizza (admin only)
// @access  Private
router.delete('/:id', [
  auth,
  requirePermission('manage_pizzas')
], async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }

    // Delete image from Cloudinary
    if (pizza.image) {
      await deleteImage(getPublicIdFromUrl(pizza.image));
    }

    await Pizza.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Pizza deleted successfully'
    });

  } catch (error) {
    console.error('Delete pizza error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }
    res.status(500).json({
      error: 'Server error while deleting pizza'
    });
  }
});

// @route   PATCH /api/pizzas/:id/toggle-availability
// @desc    Toggle pizza availability (admin only)
// @access  Private
router.patch('/:id/toggle-availability', [
  auth,
  requirePermission('manage_pizzas')
], async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }

    await pizza.toggleAvailability();

    res.json({
      success: true,
      message: `Pizza ${pizza.isAvailable ? 'made available' : 'made unavailable'}`,
      data: pizza
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        error: 'Pizza not found'
      });
    }
    res.status(500).json({
      error: 'Server error while toggling availability'
    });
  }
});

module.exports = router; 