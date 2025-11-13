import React, { useState } from 'react';
import api from '../utils/api';

const APITest = () => {
  const [result, setResult] = useState('');

  const testAPI = async () => {
    try {
      setResult('Testing API...');
      const response = await api.get('/foods');
      setResult(`✅ API Success! ${response.data.length} foods loaded`);
    } catch (error) {
      setResult(`❌ API Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h3>API Connection Test</h3>
      <button onClick={testAPI}>Test API Connection</button>
      <div style={{ marginTop: '10px' }}>{result}</div>
    </div>
  );
};

export default APITest;