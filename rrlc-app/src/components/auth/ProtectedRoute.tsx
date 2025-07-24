'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

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
  const { loading, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        bg="rgb(193,212,178)" // Light sage background
      >
        <VStack gap={4}>
          <Spinner 
            size="lg" 
            color="rgb(9,76,9)" // Deep green
          />
          <Text color="rgb(78,61,30)">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    router.push('/auth/login');
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        bg="rgb(193,212,178)"
      >
        <Text color="rgb(78,61,30)">Redirecting to login...</Text>
      </Box>
    );
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        bg="rgb(193,212,178)"
        p={8}
      >
        <VStack gap={4} textAlign="center">
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            color="rgb(78,61,30)"
          >
            Access Denied
          </Text>
          <Text color="rgb(78,61,30)">
            You need administrator privileges to access this page.
          </Text>
        </VStack>
      </Box>
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