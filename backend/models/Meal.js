const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  foods: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    quantity: { type: Number, default: 1 }
  }],
  user: { 
    type: String, 
    required: true,
    default: 'demo-user'
  },
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Calculate totals after population
mealSchema.methods.calculateTotals = async function() {
  await this.populate('foods.food');
  
  this.totalCalories = this.foods.reduce((total, item) => {
    return total + ((item.food?.calories || 0) * item.quantity);
  }, 0);
  
  this.totalProtein = this.foods.reduce((total, item) => {
    return total + ((item.food?.protein || 0) * item.quantity);
  }, 0);
  
  this.totalCarbs = this.foods.reduce((total, item) => {
    return total + ((item.food?.carbs || 0) * item.quantity);
  }, 0);
  
  this.totalFat = this.foods.reduce((total, item) => {
    return total + ((item.food?.fat || 0) * item.quantity);
  }, 0);
  
  return this.save();
};

module.exports = mongoose.model('Meal', mealSchema);