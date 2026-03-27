/**
 * Test admin API from client side
 */

// Import API setup
const api = require('./src/api').default || require('./src/api');

async function testAdminClient() {
  try {
    console.log('🧪 Testing Admin API from Client Side...');
    
    // Simulate admin login token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YmUxZDE2ODZjODRiYmEwOTI0ODU3MSIsImVtYWlsIjoiYWRtaW5AaW50ZXJuY29ubmVjdC5jb20iLCJpYXQiOjE3MjQyNzU1NjksImV4cCI6MTcyNjg2NzU2OX0.7f9x3mP8xLqK_vJ4d8X5Q9w3R5n2E1t7Y6Z3w4K5r8';
    
    // Set token in localStorage simulation
    global.localStorage = {
      getItem: (key) => key === 'token' ? token : null,
      setItem: () => {},
      removeItem: () => {}
    };

    // Test API call
    console.log('📡 Testing /admin/students endpoint...');
    
    const response = await api.get('/admin/students');
    console.log('✅ Response received:', response.status);
    console.log('📊 Students count:', response.data?.data?.length);
    
  } catch (error) {
    console.error('❌ Client API test failed:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
  }
}

// Note: This won't run in browser environment, but helps debug API setup
console.log('📝 This test shows API setup structure');
console.log('🔗 API base URL should be: http://localhost:5000/api');
console.log('🔑 Token should be automatically added to headers');
