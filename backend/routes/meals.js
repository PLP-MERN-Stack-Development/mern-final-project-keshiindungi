const express = require('express');
const Meal = require('../models/Meal');

const router = express.Router();

// Get all meals
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find().populate('user').populate('foods.food');
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meals', error: error.message });
  }
});

// Get meal by ID
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('user').populate('foods.food');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meal', error: error.message });
  }
});

// Create new meal - SIMPLIFIED VERSION
router.post('/', async (req, res) => {
  try {
    const { name, foods, user } = req.body;

    // Basic validation
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ 
        message: 'At least one food item is required' 
      });
    }

    // Validate each food item
    for (let foodItem of foods) {
      if (!foodItem.food || !foodItem.quantity || foodItem.quantity < 1) {
        return res.status(400).json({ 
          message: 'Each food item must have a valid food ID and quantity (at least 1)' 
        });
      }
    }

    // Default to breakfast if no name provided
    const mealName = name || 'breakfast';

    const meal = new Meal({
      name: mealName,
      foods: foods,
      user: user || 'demo-user'
    });

    await meal.save();
    
    // Populate the created meal with food details
    const populatedMeal = await Meal.findById(meal._id).populate('foods.food');
    res.status(201).json(populatedMeal);
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ 
      message: 'Error creating meal', 
      error: error.message 
    });
  }
});

// Update meal
router.put('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('foods.food');
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meal', error: error.message });
  }
});

// Delete meal
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal', error: error.message });
  }
});

module.exports = router;