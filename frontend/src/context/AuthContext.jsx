import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('spendwise_user'));
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spendwise_theme') || 'dark';
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('spendwise_currency') || 'INR';
  });

  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spendwise_theme', theme);
  }, [theme]);

  // Update currency
  useEffect(() => {
    localStorage.setItem('spendwise_currency', currency);
  }, [currency]);

  // Load unread count if user logged in
  useEffect(() => {
    if (user) {
      api
        .get('/notifications')
        .then((res) => {
          setUnreadNotifCount(res.data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
    return `${sym}${num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`;
  };

  const login = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      localStorage.setItem('spendwise_token', response.data.token);
      localStorage.setItem('spendwise_user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      if (response.data.user.theme) setTheme(response.data.user.theme);
      if (response.data.user.currency) setCurrency(response.data.user.currency);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      localStorage.setItem('spendwise_token', response.data.token);
      localStorage.setItem('spendwise_user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('spendwise_user', JSON.stringify(merged));
    if (updatedUser.theme) setTheme(updatedUser.theme);
    if (updatedUser.currency) setCurrency(updatedUser.currency);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatCurrency,
        unreadNotifCount,
        setUnreadNotifCount,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);