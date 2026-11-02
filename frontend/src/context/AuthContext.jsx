import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

/**
 * Intelligent error parser for Axios/DRF responses:
 * Extracts user-readable messages from field validations, network failures, and server errors.
 */
export const extractErrorMessage = (err, defaultMsg = "An unexpected error occurred.") => {
  if (!err) return defaultMsg;

  // 1. Network / Connection Error (Backend offline, Render sleeping, or CORS blocked)
  if (!err.response) {
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      return "Unable to connect to the backend server. The service may be waking up (which takes ~40 seconds on free hosting) or experiencing a network issue. Please retry in a moment.";
    }
    if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
      return "Connection timed out waiting for backend server response. Please try again.";
    }
    return err.message || defaultMsg;
  }

  const { data, status } = err.response;

  // 2. Server-side errors (500, 502, 503, 504)
  if (status >= 500) {
    return `Server error (${status}). The backend encountered an unexpected error. Please try again shortly.`;
  }

  // 3. String / HTML response
  if (typeof data === 'string') {
    if (data.trim().startsWith('<')) {
      return `Server error (${status}). Please try again shortly.`;
    }
    return data;
  }

  // 4. Structured DRF Error Dictionary or Array
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      return data[0];
    }

    // Extract first field validation error
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const val = data[firstKey];
      const fieldLabel = firstKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      if (Array.isArray(val) && val.length > 0) {
        return `${fieldLabel}: ${val[0]}`;
      }
      if (typeof val === 'string') {
        return `${fieldLabel}: ${val}`;
      }
      if (typeof val === 'object' && val !== null) {
        const subKeys = Object.keys(val);
        if (subKeys.length > 0) {
          const subVal = val[subKeys[0]];
          if (Array.isArray(subVal) && subVal.length > 0) {
            return `${fieldLabel} (${subKeys[0]}): ${subVal[0]}`;
          }
          if (typeof subVal === 'string') {
            return `${fieldLabel} (${subKeys[0]}): ${subVal}`;
          }
        }
      }
    }
  }

  return defaultMsg;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Synchronize state with background token refresh and expiry events
  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      if (e.detail?.access) {
        setToken(e.detail.access);
      }
    };

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  // Initialize and verify user session on first load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_info');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Verify and synchronize with backend in background
          const res = await axiosClient.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('user_info', JSON.stringify(res.data));
        } catch (err) {
          console.warn("Session background verification warning:", err);
          // Only destroy the session if the backend explicitly rejected the token (401 Unauthorized)
          // Do NOT log out on temporary network issues, Render cold starts, or 5xx server errors
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await axiosClient.post('/auth/login/', {
        email: email.trim().toLowerCase(),
        password,
      });
      const { access, refresh, user: userData } = res.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(userData));

      setToken(access);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = extractErrorMessage(err, "Invalid email or password. Please verify your credentials.");
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    setAuthError(null);
    try {
      const res = await axiosClient.post('/auth/register/', formData);
      const access = res.data.access || res.data.tokens?.access;
      const refresh = res.data.refresh || res.data.tokens?.refresh;
      const userData = res.data.user;

      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      if (userData) localStorage.setItem('user_info', JSON.stringify(userData));

      setToken(access || null);
      setUser(userData || null);
      return { success: true, user: userData };
    } catch (err) {
      const msg = extractErrorMessage(err, "Registration failed. Please check form inputs.");
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
