// Test file to verify environment variables
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test the full API URL
const API_URL = process.env.REACT_APP_API_URL;
console.log('Full login URL would be:', `${API_URL}/auth/login`); 