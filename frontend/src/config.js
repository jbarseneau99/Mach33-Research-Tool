// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:8080/api'
  },
  production: {
    apiUrl: 'https://research-platform-api-214656435079.us-central1.run.app/api'
  }
};

// Determine current environment
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const API_BASE_URL = config[environment].apiUrl;

// Helper function to make API calls with the correct base URL
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export default { API_BASE_URL, apiCall }; 