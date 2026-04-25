"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

/**
 * Role-based dashboard paths
 */
const ROLE_DASHBOARDS = {
  admin: '/dashboard/admin',
  coordinator: '/dashboard/coordinator',
  student: '/dashboard/student',
};

/**
 * AuthProvider — wraps the entire app, providing a single source of truth
 * for authentication state: user, isLoggedIn, login(), logout().
 */
export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // initial hydration

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsLoggedIn(true);
      }
    } catch {
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler — stores user in localStorage + state
  const login = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  // Logout handler — clears everything + redirects
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    setUser(null);
    setIsLoggedIn(false);
    toast.success('Logged out successfully.');
    router.push('/');
  }, [router]);

  // Get role-appropriate dashboard path
  const getDashboardPath = useCallback(() => {
    if (!user) return '/dashboard/student';
    return ROLE_DASHBOARDS[user.role] || '/dashboard/student';
  }, [user]);

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    getDashboardPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — hook to access authentication context from any component.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Route protection constants:
 *   Maps path prefixes to required roles.
 */
export const PROTECTED_ROUTES = {
  '/dashboard/admin': 'admin',
  '/dashboard/coordinator': 'coordinator',
  '/dashboard/student': 'student',
};

/**
 * getRequiredRole — returns the role needed for a given path, or null if public.
 */
export function getRequiredRole(pathname) {
  for (const [prefix, role] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(prefix)) return role;
  }
  return null;
}
