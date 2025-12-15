import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { apiRequest, setToken as persistToken } from "services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("seguradora_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("seguradora_user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [entidade, setEntidade] = useState(() => {
    const raw = localStorage.getItem("seguradora_entidade");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token) && !user);

  const clearSession = useCallback(() => {
    persistToken(null);
    localStorage.removeItem("seguradora_user");
    localStorage.removeItem("seguradora_entidade");
    setToken(null);
    setUser(null);
    setEntidade(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    const data = await apiRequest("/me");
    setUser(data?.user || null);
    setEntidade(data?.entidade || null);
    localStorage.setItem("seguradora_user", JSON.stringify(data?.user || null));
    localStorage.setItem("seguradora_entidade", JSON.stringify(data?.entidade || null));
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await refreshMe();
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token, refreshMe, clearSession]);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/login", { method: "POST", body: { email, password } });
    persistToken(data?.token);
    setToken(data?.token || null);
    setUser(data?.user || null);
    setEntidade(null);
    localStorage.setItem("seguradora_user", JSON.stringify(data?.user || null));
    localStorage.removeItem("seguradora_entidade");
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await apiRequest("/register", { method: "POST", body: payload });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      entidade,
      perfil: user?.perfil || null,
      isAuthenticated: Boolean(token),
      loading,
      login,
      register,
      logout,
      refreshMe,
      clearSession,
    }),
    [token, user, entidade, loading, login, register, logout, refreshMe, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
