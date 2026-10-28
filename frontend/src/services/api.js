import axios from 'axios';

/* =========================================================
   SPENDWISE API CONFIGURATION
   ========================================================= */

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5001/api',
});

/* =========================================================
   AUTH TOKEN INTERCEPTOR
   ========================================================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spendwise_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================================================
   EXPORT API
   ========================================================= */

export default api;