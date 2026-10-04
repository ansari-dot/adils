import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: (message?: string) => void;
  updateUser: (user: AdminUser) => void;
  refreshUser: () => Promise<void>;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('bakery_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bakery_admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('bakery_admin_theme') as 'light' | 'dark' | 'system') || 'system';
  });

  const { success, error, warning } = useToast();

  // Apply theme effect
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('bakery_admin_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  const logout = useCallback(
    (reasonMsg?: string) => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('bakery_admin_token');
      localStorage.removeItem('bakery_admin_user');
      if (reasonMsg) {
        warning(reasonMsg);
      }
    },
    [warning]
  );

  // Validate session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('bakery_admin_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.user && res.user.role === 'admin') {
          setUser(res.user);
          localStorage.setItem('bakery_admin_user', JSON.stringify(res.user));
          if (res.user.theme) {
            setThemeState(res.user.theme);
          }
        } else {
          logout('Session invalid or unauthorized. Please log in.');
        }
      } catch {
        logout('Session expired. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for 401 broadcast
    const handleExpired = () => {
      logout('Your session has expired. Please sign in again.');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => {
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, [logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token && res.user) {
        if (res.user.role !== 'admin') {
          error('Access Denied: Administrator role required.');
          return false;
        }
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('bakery_admin_token', res.token);
        localStorage.setItem('bakery_admin_user', JSON.stringify(res.user));
        if (res.user.theme) {
          setThemeState(res.user.theme);
        }
        success(`Welcome back, ${res.user.name}`);
        return true;
      }
      error(res.message || 'Login failed.');
      return false;
    } catch (err: any) {
      error(err.message || 'Network error during login.');
      return false;
    }
  };

  const updateUser = (updated: AdminUser) => {
    setUser(updated);
    localStorage.setItem('bakery_admin_user', JSON.stringify(updated));
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        updateUser(res.user);
      }
    } catch {
      // ignore
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user && user.role === 'admin'),
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
    theme,
    setTheme,
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
