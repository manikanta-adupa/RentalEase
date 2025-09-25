// Local development backend - use your computer's IP for phone connection
// Try this IP first: 192.168.31.208
// If it doesn't work, check your phone's WiFi settings and make sure it's on the same network
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://rentalease-backend.onrender.com/api';
// No trailing slash to avoid double "//" when composing paths
// const API_ROOT = 'http://localhost:5000';
const API_ROOT = 'https://rentalease-backend.onrender.com';

// Debug: Log the API configuration
console.log('🔍 API Configuration:');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('API_ROOT:', API_ROOT);

//ES module export
export { API_BASE_URL, API_ROOT };

// Using deployed backend on Render (perfect for company laptops!)
// 
// Using deployed backend on Render (perfect for company laptops!)
// const API_BASE_URL = 'https://rentalease-backend.onrender.com/api';