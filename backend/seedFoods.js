const mongoose = require('mongoose');
const Food = require('./models/food');
require('dotenv').config();

const sampleFoods = [
  // Fruits
  {
    name: "Apple",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    category: "fruit",
    servingSize: { amount: 1, unit: "medium" }
  },
  {
    name: "Banana",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    category: "fruit",
    servingSize: { amount: 1, unit: "medium" }
  },
  {
    name: "Orange",
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    category: "fruit",
    servingSize: { amount: 1, unit: "medium" }
  },
  {
    name: "Strawberries",
    calories: 32,
    protein: 0.7,
    carbs: 8,
    fat: 0.3,
    category: "fruit",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Blueberries",
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    category: "fruit",
    servingSize: { amount: 100, unit: "g" }
  },

  // Vegetables
  {
    name: "Broccoli",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    category: "vegetable",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Spinach",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    category: "vegetable",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Carrots",
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    category: "vegetable",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Sweet Potato",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    category: "vegetable",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Avocado",
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    category: "vegetable",
    servingSize: { amount: 100, unit: "g" }
  },

  // Proteins
  {
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: "protein",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Salmon",
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    category: "protein",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Eggs",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    category: "protein",
    servingSize: { amount: 2, unit: "large" }
  },
  {
    name: "Greek Yogurt",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    category: "protein",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Tofu",
    calories: 76,
    protein: 8,
    carbs: 2,
    fat: 4,
    category: "protein",
    servingSize: { amount: 100, unit: "g" }
  },

  // Grains
  {
    name: "Brown Rice",
    calories: 112,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    category: "grain",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Oatmeal",
    calories: 68,
    protein: 2.4,
    carbs: 12,
    fat: 1.4,
    category: "grain",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Whole Wheat Bread",
    calories: 265,
    protein: 13,
    carbs: 51,
    fat: 4,
    category: "grain",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Quinoa",
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    category: "grain",
    servingSize: { amount: 100, unit: "g" }
  },

  // Dairy
  {
    name: "Milk",
    calories: 42,
    protein: 3.4,
    carbs: 5,
    fat: 1,
    category: "dairy",
    servingSize: { amount: 100, unit: "ml" }
  },
  {
    name: "Cheddar Cheese",
    calories: 404,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    category: "dairy",
    servingSize: { amount: 100, unit: "g" }
  },

  // Other
  {
    name: "Almonds",
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    category: "other",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Peanut Butter",
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    category: "other",
    servingSize: { amount: 100, unit: "g" }
  },
  {
    name: "Dark Chocolate",
    calories: 546,
    protein: 4.9,
    carbs: 61,
    fat: 31,
    category: "other",
    servingSize: { amount: 100, unit: "g" }
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing foods
    await Food.deleteMany({});
    console.log('✅ Cleared existing foods');

    // Insert sample foods
    await Food.insertMany(sampleFoods);
    console.log(`✅ Added ${sampleFoods.length} sample foods to database`);

    // Display categories count
    const categories = {};
    sampleFoods.forEach(food => {
      categories[food.category] = (categories[food.category] || 0) + 1;
    });

    console.log('\n📊 Food Categories:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} foods`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();