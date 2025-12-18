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
                if (response.data.entidade) {
                    localStorage.setItem('entidade', JSON.stringify(response.data.entidade));
                }
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
                // Logic to extract entity data
                let entidade = response.data.entidade;

                // If not found in root, check inside user object using 'entidade' key or dynamic profile key
                if (!entidade && response.data.user) {
                    entidade = response.data.user.entidade;

                    if (!entidade && response.data.user.perfil) {
                        // The backend returns the relation with the same name as the profile
                        // e.g. user.seguradora, user.corretora
                        entidade = response.data.user[response.data.user.perfil];
                    }
                }

                if (entidade) {
                    localStorage.setItem('entidade', JSON.stringify(entidade));
                }

                // Return response with the extracted entity to ensure Context updates immediately
                return {
                    ...response.data,
                    entidade: entidade
                };
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
            localStorage.removeItem('entidade');
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await api.get('/me');
            if (response.data.entidade) {
                localStorage.setItem('entidade', JSON.stringify(response.data.entidade));
            }
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

    // Get current entity from localStorage
    getCurrentEntity: () => {
        const entityStr = localStorage.getItem('entidade');
        if (entityStr) {
            try {
                return JSON.parse(entityStr);
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
