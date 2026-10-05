import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shiptrack_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize session from token
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('[AUTH_INIT] Stored session expired or invalid:', err.message);
          localStorage.removeItem('shiptrack_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('shiptrack_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    localStorage.setItem('shiptrack_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors during logout
    }
    localStorage.removeItem('shiptrack_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
