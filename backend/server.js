const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all origins in development
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutri-ai')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models (make sure these files exist)
const Food = require('./models/food');
const Meal = require('./models/Meal');

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nutri-AI API is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Get all foods from database
app.get('/api/foods', async (req, res) => {
  try {
    console.log('📦 GET /api/foods - Fetching all foods from database');
    const foods = await Food.find();
    console.log(`✅ Found ${foods.length} foods`);
    res.json(foods);
  } catch (error) {
    console.error('❌ Error fetching foods:', error);
    res.status(500).json({ message: 'Error fetching foods', error: error.message });
  }
});

// Get meals for specific user
app.get('/api/meals', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('📦 GET /api/meals - Fetching meals for user:', userId);
    
    let query = {};
    if (userId && userId !== 'demo-user') {
      query.user = userId;
    }
    
    const meals = await Meal.find(query).populate('foods.food');
    console.log(`✅ Found ${meals.length} meals for user ${userId}`);
    res.json(meals);
  } catch (error) {
    console.error('❌ Error fetching meals:', error);
    res.status(500).json({ message: 'Error fetching meals', error: error.message });
  }
});

// Create meal with real calculation
app.post('/api/meals', async (req, res) => {
  try {
    console.log('📦 POST /api/meals - Creating meal:', req.body);
    
    const meal = new Meal(req.body);
    await meal.save();
    
    // Calculate totals after saving
    await meal.calculateTotals();
    
    // Populate the meal with food details
    const populatedMeal = await Meal.findById(meal._id).populate('foods.food');
    
    console.log('✅ Meal created successfully:', {
      id: populatedMeal._id,
      name: populatedMeal.name,
      totalCalories: populatedMeal.totalCalories,
      totalProtein: populatedMeal.totalProtein,
      totalCarbs: populatedMeal.totalCarbs,
      totalFat: populatedMeal.totalFat
    });
    
    res.status(201).json(populatedMeal);
  } catch (error) {
    console.error('❌ Error creating meal:', error);
    res.status(500).json({ message: 'Error creating meal', error: error.message });
  }
});
// User Registration
app.post('/api/users/register', async (req, res) => {
  try {
    console.log('📦 POST /api/users/register - Registering user:', req.body);
    
    const { username, email, password, goals } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    // TODO: Add password hashing (install bcrypt: npm install bcryptjs)
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    // Simple user creation (you'll need a User model)
    const user = {
      _id: new mongoose.Types.ObjectId(),
      username,
      email,
      password, // In production, store hashed password!
      goals: goals || 'maintenance',
      createdAt: new Date()
    };

    console.log('✅ User registered successfully:', { username, email });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        goals: user.goals
      }
    });
  } catch (error) {
    console.error('❌ Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    console.log('📦 POST /api/users/login - User login:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // TODO: Add real authentication logic
    // const user = await User.findOne({ email });
    // const validPassword = await bcrypt.compare(password, user.password);
    
    // For now, simple mock response
    console.log('✅ User logged in successfully:', { email });
    
    res.json({
      message: 'Login successful',
      user: {
        id: 'mock-user-id',
        username: 'mock-username',
        email: email,
        goals: 'maintenance'
      },
      token: 'mock-jwt-token' // In production, use jsonwebtoken
    });
  } catch (error) {
    console.error('❌ Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Create meal with real calculation
app.post('/api/meals', async (req, res) => {
  try {
    console.log('📦 POST /api/meals - Creating meal:', req.body);
    
    const meal = new Meal(req.body);
    await meal.save();
    
    // Populate the meal with food details
    await meal.populate('foods.food');
    
    console.log('✅ Meal created successfully:', {
      id: meal._id,
      name: meal.name,
      totalCalories: meal.totalCalories
    });
    
    res.status(201).json(meal);
  } catch (error) {
    console.error('❌ Error creating meal:', error);
    res.status(500).json({ message: 'Error creating meal', error: error.message });
  }
});
// Enhanced AI Recommendations Endpoint
app.get('/api/recommendations', async (req, res) => {
  try {
    console.log('🤖 GET /api/recommendations - Generating AI recommendations');
    
    const { 
      userGoals = 'maintenance', 
      currentCalories = 0,
      mealType = '',
      recentMeals = ''
    } = req.query;
    
    // Enhanced AI recommendation logic
    const recommendations = generateMealSpecificRecommendations(
      userGoals, 
      parseInt(currentCalories),
      mealType,
      recentMeals
    );
    
    console.log('✅ Recommendations generated for', mealType || 'general', ':', recommendations.length);
    res.json(recommendations);
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations', error: error.message });
  }
});

// Enhanced AI Recommendation Logic
function generateMealSpecificRecommendations(userGoals, currentCalories, mealType, recentMeals) {
  const baseRecommendations = [];
  
  // Meal type specific recommendations
  if (mealType) {
    const mealRecs = getMealTypeRecommendations(mealType, userGoals);
    baseRecommendations.push(...mealRecs);
  }
  
  // General nutrition tips
  baseRecommendations.push(...getGeneralNutritionTips());
  
  // Goal-specific recommendations
  const goalRecs = getGoalSpecificRecommendations(userGoals, currentCalories);
  baseRecommendations.push(...goalRecs);
  
  // Calorie-based recommendations
  const calorieRecs = getCalorieBasedRecommendations(currentCalories);
  baseRecommendations.push(...calorieRecs);
  
  // Remove duplicates and limit to 5 recommendations
  return baseRecommendations
    .filter((rec, index, self) => 
      index === self.findIndex(r => r.title === rec.title)
    )
    .slice(0, 5);
}

// Meal Type Specific Recommendations
function getMealTypeRecommendations(mealType, userGoals) {
  const mealRecommendations = {
    breakfast: [
      {
        type: 'meal_timing',
        title: '🌅 Breakfast Boost',
        message: 'Include protein and complex carbs for sustained energy throughout the morning.',
        priority: 'high',
        mealType: 'breakfast'
      },
      {
        type: 'food_suggestion',
        title: '🥚 Protein Power',
        message: 'Consider eggs, Greek yogurt, or protein smoothie to keep you full until lunch.',
        priority: 'medium',
        mealType: 'breakfast'
      },
      {
        type: 'nutrition_tip',
        title: '💧 Morning Hydration',
        message: 'Start your day with a glass of water to rehydrate after sleep.',
        priority: 'high',
        mealType: 'breakfast'
      }
    ],
    lunch: [
      {
        type: 'meal_balance',
        title: '🥗 Balanced Lunch',
        message: 'Aim for 50% vegetables, 25% protein, and 25% whole grains for optimal nutrition.',
        priority: 'medium',
        mealType: 'lunch'
      },
      {
        type: 'energy_tip',
        title: '⚡ Afternoon Energy',
        message: 'Include lean protein and complex carbs to avoid afternoon energy crashes.',
        priority: 'medium',
        mealType: 'lunch'
      },
      {
        type: 'food_suggestion',
        title: '🥦 Veggie Focus',
        message: 'Add at least 2 different colored vegetables for varied nutrients.',
        priority: 'medium',
        mealType: 'lunch'
      }
    ],
    dinner: [
      {
        type: 'meal_timing',
        title: '🌙 Light Dinner',
        message: 'Keep dinner lighter and finish 2-3 hours before bedtime for better digestion.',
        priority: 'medium',
        mealType: 'dinner'
      },
      {
        type: 'food_suggestion',
        title: '🍗 Lean Protein',
        message: 'Choose grilled fish, chicken, or plant-based proteins for easier digestion at night.',
        priority: 'medium',
        mealType: 'dinner'
      },
      {
        type: 'nutrition_tip',
        title: '🌿 Herb Benefits',
        message: 'Use herbs like turmeric, ginger, or garlic for anti-inflammatory benefits.',
        priority: 'low',
        mealType: 'dinner'
      }
    ],
    snack: [
      {
        type: 'snack_timing',
        title: '🕒 Smart Snacking',
        message: 'Plan snacks between meals to maintain energy levels and prevent overeating.',
        priority: 'medium',
        mealType: 'snack'
      },
      {
        type: 'food_suggestion',
        title: '🥜 Protein Snacks',
        message: 'Choose protein-rich snacks like nuts, cheese, or hummus with veggies.',
        priority: 'medium',
        mealType: 'snack'
      },
      {
        type: 'portion_tip',
        title: '📏 Portion Control',
        message: 'Pre-portion snacks to avoid mindless eating.',
        priority: 'high',
        mealType: 'snack'
      }
    ]
  };

  return mealRecommendations[mealType] || [];
}

// General Nutrition Tips
function getGeneralNutritionTips() {
  return [
    {
      type: 'hydration',
      title: '💧 Stay Hydrated',
      message: 'Drink at least 8 glasses of water throughout the day.',
      priority: 'high'
    },
    {
      type: 'variety',
      title: '🌈 Eat the Rainbow',
      message: 'Include fruits and vegetables of different colors for diverse nutrients.',
      priority: 'medium'
    }
  ];
}

// Goal Specific Recommendations
function getGoalSpecificRecommendations(userGoals, currentCalories) {
  const goalTips = [];
  
  if (userGoals === 'weight_loss') {
    goalTips.push({
      type: 'goal_tip',
      title: '⚖️ Weight Loss Strategy',
      message: 'Focus on high-volume, low-calorie foods like vegetables and lean proteins.',
      priority: 'high'
    });
    
    if (currentCalories > 2000) {
      goalTips.push({
        type: 'calorie_alert',
        title: '📊 Calorie Awareness',
        message: 'Consider smaller portions or more vegetables to reduce calorie density.',
        priority: 'high'
      });
    }
    
  } else if (userGoals === 'muscle_gain') {
    goalTips.push({
      type: 'goal_tip',
      title: '💪 Muscle Building',
      message: 'Ensure adequate protein intake (1.6-2.2g per kg of body weight) post-workout.',
      priority: 'high'
    });
    
    if (currentCalories < 2000) {
      goalTips.push({
        type: 'calorie_alert',
        title: '📈 Increase Calories',
        message: 'Consider adding calorie-dense foods like nuts, avocados, or whole grains.',
        priority: 'medium'
      });
    }
    
  } else { // maintenance
    goalTips.push({
      type: 'goal_tip',
      title: '🔄 Maintenance Mode',
      message: 'Focus on balanced meals and consistent eating patterns.',
      priority: 'medium'
    });
  }
  
  return goalTips;
}

// Calorie Based Recommendations
function getCalorieBasedRecommendations(currentCalories) {
  const calorieTips = [];
  
  if (currentCalories < 1200) {
    calorieTips.push({
      type: 'calorie_warning',
      title: '⚠️ Low Calorie Intake',
      message: 'Your calorie intake seems low. Consider adding nutrient-dense foods.',
      priority: 'high'
    });
  } else if (currentCalories > 3000) {
    calorieTips.push({
      type: 'calorie_warning',
      title: '⚠️ High Calorie Intake',
      message: 'Consider balancing with more vegetables and monitoring portion sizes.',
      priority: 'medium'
    });
  }
  
  return calorieTips;
}

/// Handle 404 routes - SIMPLE FIX
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Foods API: http://localhost:${PORT}/api/foods`);
  console.log(`📍 Recommendations: http://localhost:${PORT}/api/recommendations`);
});