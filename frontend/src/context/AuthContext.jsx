import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify user session on first load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_info');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await axiosClient.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('user_info', JSON.stringify(res.data));
        } catch (err) {
          console.error("Session verification failed, logging out:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await axiosClient.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(userData));

      setToken(access);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid email or password. Please verify your credentials.";
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    setAuthError(null);
    try {
      const res = await axiosClient.post('/auth/register/', formData);
      const { tokens, user: userData } = res.data;

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_info', JSON.stringify(userData));

      setToken(tokens.access);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      let msg = "Registration failed. Please check form inputs.";
      if (err.response?.data) {
        const errors = err.response.data;
        const firstKey = Object.keys(errors)[0];
        if (Array.isArray(errors[firstKey])) {
          msg = `${firstKey}: ${errors[firstKey][0]}`;
        } else if (typeof errors[firstKey] === 'string') {
          msg = errors[firstKey];
        }
      }
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'FARMER',
    isBuyer: user?.role === 'BUYER',
    isAdmin: user?.role === 'ADMIN',
    loading,
    authError,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
