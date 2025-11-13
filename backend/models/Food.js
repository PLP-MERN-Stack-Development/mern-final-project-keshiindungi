const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fat: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['fruit', 'vegetable', 'protein', 'grain', 'dairy', 'other']
  },
  servingSize: {
    amount: Number,
    unit: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);