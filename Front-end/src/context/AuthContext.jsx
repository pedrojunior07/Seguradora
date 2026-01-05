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
        const initAuth = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    // Tenta buscar perfil atualizado do servidor
                    const data = await authService.getProfile();
                    setUser(data.user);
                    if (data.entidade) {
                        setEntidade(data.entidade);
                    }
                } catch (error) {
                    console.error("Erro ao buscar perfil:", error);
                    // Se falhar (token expirado?), tenta usar o cache local ou faz logout
                    const cachedUser = authService.getCurrentUser();
                    if (cachedUser) setUser(cachedUser);

                    const cachedEntity = authService.getCurrentEntity();
                    if (cachedEntity) setEntidade(cachedEntity);

                    // Opcional: Se for erro 401, fazer logout
                    if (error.response && error.response.status === 401) {
                        logout();
                    }
                }
            } else {
                setLoading(false);
            }
            setLoading(false);
        };
        initAuth();
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
