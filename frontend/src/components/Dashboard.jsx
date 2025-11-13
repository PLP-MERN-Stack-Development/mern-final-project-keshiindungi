import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const apiCall = async (endpoint, options = {}) => {
  const url = `http://localhost:5000/api${endpoint}`;
  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(` API Success: ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error(` API Error: ${endpoint}`, error);
    throw error;
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('breakfast');
  const [nutritionData, setNutritionData] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('Checking connection...');

  useEffect(() => {
    console.log('Dashboard mounted');
    testConnection();
    loadData();
  }, []);

  useEffect(() => {
    // Load recommendations when nutrition data changes
    if (nutritionData.totalCalories > 0) {
      loadRecommendations();
    }
  }, [nutritionData.totalCalories]);

  const testConnection = async () => {
    try {
      setApiStatus('Testing backend connection...');
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      setApiStatus(`Backend connected: ${data.status}`);
    } catch (error) {
      setApiStatus(' Backend not reachable');
      console.error('Connection test failed:', error);
    }
  };

 const loadData = async () => {
  try {
    setError('');
    setLoading(true);
    
    console.log('Loading foods...');
    const foodsData = await apiCall('/foods');
    setFoods(foodsData);
    
    console.log('Loading meals for user:', user?.id);
    // Pass user ID to get only their meals
    const mealsData = await apiCall(`/meals?userId=${user?.id || 'demo-user'}`);
    setMeals(mealsData);
    
    calculateNutrition(mealsData);
    setLoading(false);
    
  } catch (error) {
    console.error('Error loading data:', error);
    setError('Failed to load data. Please check if backend is running on port 5000.');
    setLoading(false);
  }
};
const loadRecommendations = async () => {
  try {
    console.log('Loading AI recommendations for meal type:', mealType);
    
    // Get user goals from your auth context or user data
    const userGoals = user?.goals || 'maintenance';
    
    const recs = await apiCall(
      `/recommendations?currentCalories=${nutritionData.totalCalories}&mealType=${mealType}&userGoals=${userGoals}`
    );
    
    setRecommendations(recs);
    console.log(` Loaded ${recs.length} recommendations for ${mealType}`);
    
  } catch (error) {
    console.error('Error loading recommendations:', error);
    // Don't show error for recommendations - they're optional
  }
};

useEffect(() => {
  // Load recommendations when meal type changes or nutrition data updates
  if (nutritionData.totalCalories > 0) {
    loadRecommendations();
  }
}, [mealType, nutritionData.totalCalories]); 


  const calculateNutrition = (meals) => {
    const totals = meals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + (meal.totalCalories || 0),
      totalProtein: acc.totalProtein + (meal.totalProtein || 0),
      totalCarbs: acc.totalCarbs + (meal.totalCarbs || 0),
      totalFat: acc.totalFat + (meal.totalFat || 0)
    }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

    console.log(' Nutrition totals:', totals);
    setNutritionData(totals);
  };
const addMeal = async (e) => {
  e.preventDefault();
  
  if (!selectedFood) {
    setError('Please select a food');
    return;
  }

  try {
    setError('');
    
    const mealData = {
      name: mealType,
      foods: [{
        food: selectedFood,
        quantity: parseInt(quantity) || 1
      }],
      user: user?.id || 'demo-user' // Make sure this is set
    };

    console.log('Creating meal for user:', mealData.user);
    
    const newMeal = await apiCall('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData)
    });
    
    // Update meals list and recalculate nutrition
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    calculateNutrition(updatedMeals);
    
    setSelectedFood('');
    setQuantity(1);
    setError(' Meal added successfully!');
    
    setTimeout(() => setError(''), 3000);
    
  } catch (error) {
    console.error('Error adding meal:', error);
    setError('Failed to add meal: ' + error.message);
  }
};

  const clearError = () => {
    setError('');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <h2>🍎 Nutri AI</h2>
          <p>Loading your nutrition data...</p>
          <div className="api-status">{apiStatus}</div>
          <button onClick={loadData} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🍎 Nutri AI</h1>
        <p>Your intelligent nutrition tracker</p>
        <div className="api-status">{apiStatus}</div>
        <button onClick={loadData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {error && (
        <div className={`message-banner ${error.includes('✅') ? 'success' : 'error'}`}>
          {error}
          <button onClick={clearError} className="close-btn">×</button>
        </div>
      )}

      {user ? (
        <div className="dashboard-content">
          {/* Nutrition Summary */}
          <div className="nutrition-summary">
            <h2>Today's Nutrition</h2>
            <div className="nutrition-cards">
              <div className="nutrition-card">
                <h3>Calories</h3>
                <p className={nutritionData.totalCalories > 0 ? 'has-data' : ''}>
                  {nutritionData.totalCalories}
                </p>
                <span>kcal</span>
              </div>
              <div className="nutrition-card">
                <h3>Protein</h3>
                <p className={nutritionData.totalProtein > 0 ? 'has-data' : ''}>
                  {nutritionData.totalProtein.toFixed(1)}
                </p>
                <span>g</span>
              </div>
              <div className="nutrition-card">
                <h3>Carbs</h3>
                <p className={nutritionData.totalCarbs > 0 ? 'has-data' : ''}>
                  {nutritionData.totalCarbs.toFixed(1)}
                </p>
                <span>g</span>
              </div>
              <div className="nutrition-card">
                <h3>Fat</h3>
                <p className={nutritionData.totalFat > 0 ? 'has-data' : ''}>
                  {nutritionData.totalFat.toFixed(1)}
                </p>
                <span>g</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>🤖 AI Recommendations</h3>
              <div className="recommendations-grid">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="recommendation-card"
                    style={{ borderLeftColor: getPriorityColor(rec.priority) }}
                  >
                    <div className="recommendation-header">
                      <h4>{rec.title}</h4>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(rec.priority) }}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="recommendation-message">{rec.message}</p>
                    <div className="recommendation-type">{rec.type.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Meal Form */}
          <div className="add-meal-section">
            <h3>Add Food to Your Day</h3>
            <form onSubmit={addMeal} className="meal-form">
              <div className="form-row">
                <select 
                  value={mealType} 
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>

                <select 
                  value={selectedFood} 
                  onChange={(e) => setSelectedFood(e.target.value)}
                  required
                >
                  <option value="">Select Food ({foods.length} available)</option>
                  {foods.map(food => (
                    <option key={food._id} value={food._id}>
                      {food.name} ({food.calories} kcal)
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  placeholder="Quantity"
                />

                <button type="submit" disabled={!selectedFood}>
                  ➕ Add Food
                </button>
              </div>
            </form>
          </div>

          {/* Today's Meals */}
          <div className="meals-list">
            <h3>Today's Meals ({meals.length})</h3>
            
            {meals.length === 0 ? (
              <div className="empty-state">
                <p>🥗 No meals recorded today.</p>
                <p>Select a food and click "Add Food" to get started!</p>
              </div>
            ) : (
              meals.map(meal => (
                <div key={meal._id} className="meal-item">
                  <div className="meal-header">
                    <h4>{meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}</h4>
                    <span className="meal-total-calories">
                      {meal.totalCalories || 0} kcal
                    </span>
                  </div>
                  
                  <div className="meal-foods">
                    {meal.foods.map((item, index) => (
                      <div key={index} className="food-item">
                        <span className="food-name">
                          {item.food?.name || 'Loading...'} 
                          <span className="food-quantity"> × {item.quantity}</span>
                        </span>
                        <span className="food-calories">
                          {((item.food?.calories || 0) * item.quantity).toFixed(0)} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {(meal.totalProtein > 0 || meal.totalCarbs > 0 || meal.totalFat > 0) && (
                    <div className="meal-nutrition">
                      <div className="nutrition-details">
                        {meal.totalProtein > 0 && <span>Protein: {meal.totalProtein}g</span>}
                        {meal.totalCarbs > 0 && <span>Carbs: {meal.totalCarbs}g</span>}
                        {meal.totalFat > 0 && <span>Fat: {meal.totalFat}g</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome to Nutri AI! 🥗</h2>
            <p>Please log in or register to start tracking your nutrition!</p>
            <div className="debug-info">
              <p><strong>Backend Status:</strong> {apiStatus}</p>
              <p><strong>Foods Loaded:</strong> {foods.length}</p>
              <p><strong>Meals Loaded:</strong> {meals.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;