import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const STORAGE_BASE_URL = API_BASE_URL.replace('/api', '/storage');

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
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

            // Handle 403 Forbidden - Entity not verified
            if (error.response.status === 403 && error.response.data?.error === 'ENTITY_NOT_VERIFIED') {
                window.dispatchEvent(new CustomEvent('entity-not-verified', { 
                    detail: { 
                        message: error.response.data.message,
                        isSeguradora: window.location.pathname.includes('/seguradora')
                    } 
                }));
            }

            // Handle other errors
            const errorMessage = error.response.data?.message || 'An error occurred';

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
