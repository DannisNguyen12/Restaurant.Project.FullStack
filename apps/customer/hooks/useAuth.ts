'use client';
import { useState, useEffect } from 'react';
import { UserPayload } from '../utils/auth';
import { useToast } from '../context/ToastContext';

export const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Failed to check authentication status');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        addToast({
          type: 'success',
          title: 'Welcome back!',
          message: `Signed in as ${userData.email}`,
        });
        return { success: true };
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Login failed';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Sign in failed',
          message: errorMessage,
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = 'Network error occurred';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Connection failed',
        message: 'Please check your internet connection and try again',
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      addToast({
        type: 'success',
        title: 'Signed out',
        message: 'You have been successfully signed out',
      });
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      const errorMessage = 'Logout failed, but you have been signed out locally';
      setError(errorMessage);
      addToast({
        type: 'warning',
        title: 'Signed out locally',
        message: 'Could not connect to server, but you have been signed out locally',
      });
      return { success: false, error: errorMessage };
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    checkAuthStatus,
    clearError: () => setError(null),
  };
};
