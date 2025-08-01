'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// No imports needed - using Tailwind CSS

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallback 
}: ProtectedRouteProps) {
  const { loading, isAdmin, isAuthenticated, isAuthReady, profileLoading } = useAuth();
  const router = useRouter();

  // Handle redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (!loading && !isAuthenticated() && !fallback) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, fallback, router]);

  // Show loading spinner while checking auth or loading profile data
  if (loading || (isAuthenticated() && !isAuthReady())) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-accent">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-primary-dark">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect message if not authenticated
  if (!isAuthenticated()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-accent">
        <p className="text-primary-dark">Redirecting to login...</p>
      </div>
    );
  }

  // Check admin requirement (only after auth is fully ready)
  if (requireAdmin && isAuthReady() && !isAdmin()) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-accent p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xl font-bold text-primary-dark">
            Access Denied
          </p>
          <p className="text-primary-dark">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component version for easier use
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin={requireAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}