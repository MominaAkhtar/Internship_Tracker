import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login, register, forgotPassword, resetPassword } from '../services/auth';
import { registerUnauthorizedHandler } from '../api/client';

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
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      if (res && res.success) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Load profile on load
    loadUser();
    
    // Register 401 callback for Axios Client
    registerUnauthorizedHandler(() => {
      logout();
      window.dispatchEvent(new CustomEvent('session-expired'));
    });
  }, [loadUser, logout]);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.access_token) {
        localStorage.setItem('token', res.access_token);
        // Load actual user details
        const userRes = await getMe();
        if (userRes && userRes.success) {
          setUser(userRes.data);
          return userRes.data;
        }
      }
      throw new Error('Invalid authentication response');
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res && res.success) {
        // Log in immediately
        return await loginUser(email, password);
      }
      throw new Error(res.message || 'Registration failed');
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser: logout,
        reloadProfile: loadUser,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
