import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('novareserve_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth from token on mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.auth.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('novareserve_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const saveAuthSession = (authData) => {
    localStorage.setItem('novareserve_token', authData.token);
    setToken(authData.token);
    setUser(authData.user);
  };

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    saveAuthSession(res);
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    saveAuthSession(res);
    return res.user;
  };

  const quickLogin = async (role = 'admin') => {
    const res = await api.auth.demoLogin(role);
    saveAuthSession(res);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('novareserve_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    quickLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
