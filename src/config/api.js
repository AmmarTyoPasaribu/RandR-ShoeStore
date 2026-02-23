// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://rnr-backend-production-069d.up.railway.app'
  : 'http://localhost:5000';

export const API_URL = `${API_BASE_URL}/api`;

export default API_URL;