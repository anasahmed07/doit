import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for sending cookies
});

// Request interceptor to add headers if needed (though cookies are automatic)
api.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401s (e.g., redirect to login)
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Optional: Redirect to login or refresh token
    if (typeof window !== 'undefined') {
        // window.location.href = '/sign-in';
    }
  }
  return Promise.reject(error);
});

export default api;
