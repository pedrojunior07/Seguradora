import api from './api';

const authService = {
    // Register a new user (seguradora, corretora, or cliente)
    register: async (userData, perfil) => {
        try {
            const response = await api.post('/register', {
                ...userData,
                perfil,
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Login
    login: async (email, password) => {
        try {
            const response = await api.post('/login', {
                email,
                password,
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await api.get('/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Refresh token
    refreshToken: async () => {
        try {
            const response = await api.post('/refresh');

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // Get token from localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;
