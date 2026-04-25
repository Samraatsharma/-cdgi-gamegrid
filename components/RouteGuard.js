"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, getRequiredRole } from '../lib/auth-context';

/**
 * RouteGuard — wraps the children and checks if the user is authorized
 * for the current route. If not, redirects to login or appropriate dashboard.
 * 
 * This component is used in the root layout to protect all routes.
 */
export default function RouteGuard({ children }) {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait for auth hydration

    const requiredRole = getRequiredRole(pathname);

    // If route doesn't require auth, allow access
    if (!requiredRole) return;

    // If user is not logged in, redirect to login
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // If user role doesn't match the required role, redirect to their own dashboard
    if (user.role !== requiredRole) {
      const correctDash = user.role === 'admin' ? '/dashboard/admin'
        : user.role === 'coordinator' ? '/dashboard/coordinator'
        : '/dashboard/student';
      router.push(correctDash);
    }
  }, [pathname, user, isLoggedIn, loading, router]);

  // While loading, show a spinner for protected routes
  if (loading) {
    const requiredRole = getRequiredRole(pathname);
    if (requiredRole) {
      return (
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
  }

  return children;
}
