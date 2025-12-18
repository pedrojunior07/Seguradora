import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '@services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [entidade, setEntidade] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const currentUser = authService.getCurrentUser();
        const currentEntity = authService.getCurrentEntity();
        if (currentUser) {
            setUser(currentUser);
        }
        if (currentEntity) {
            setEntidade(currentEntity);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.user);
        if (data.entidade) {
            setEntidade(data.entidade);
        }
        return data;
    };

    const register = async (userData, perfil) => {
        const data = await authService.register(userData, perfil);
        setUser(data.user);
        if (data.entidade) {
            setEntidade(data.entidade);
        }
        return data;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setEntidade(null);
    };

    const value = {
        user,
        entidade,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
