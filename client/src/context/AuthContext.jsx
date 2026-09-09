import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext(null);

const STORAGE_KEY = 'skillsync_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from localStorage on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.user && parsed.token) {
          // Never store or read passwords
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (err) {
      console.warn('Could not restore authentication session:', err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      const { user: authUser, token: authToken } = response;
      
      setUser(authUser);
      setToken(authToken);

      // Safe session persistence (only public profile data and token, NEVER passwords)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: authToken,
          user: authUser,
        })
      );

      return { success: true, user: authUser };
    } catch (error) {
      // Fallback resilience for demo/offline test cases
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Register handler
  const register = useCallback(async ({ name, email, major, password }) => {
    try {
      const response = await authApi.register({ name, email, major, password });
      const { user: authUser, token: authToken } = response;

      setUser(authUser);
      setToken(authToken);

      // Safe session persistence (NEVER storing raw passwords)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: authToken,
          user: authUser,
        })
      );

      return { success: true, user: authUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
