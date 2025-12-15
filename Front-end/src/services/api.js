import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Handle other errors
            const errorMessage = error.response.data?.message || 'An error occurred';
            console.error('API Error:', errorMessage);

            return Promise.reject({
                status: error.response.status,
                message: errorMessage,
                data: error.response.data,
            });
        } else if (error.request) {
            console.error('Network Error:', error.request);
            return Promise.reject({
                status: 0,
                message: 'Network error. Please check your connection.',
            });
        } else {
            console.error('Error:', error.message);
            return Promise.reject({
                status: 0,
                message: error.message,
            });
        }
    }
);

export default api;
