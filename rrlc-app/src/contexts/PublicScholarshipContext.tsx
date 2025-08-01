"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Scholarship } from '@/types/database';
import { getActiveScholarships, getScholarshipById } from '@/services/scholarships';

interface PublicScholarshipContextType {
  scholarships: Scholarship[];
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshScholarships: () => Promise<void>;
  getScholarshipFromCache: (id: string) => Scholarship | undefined;
}

const PublicScholarshipContext = createContext<PublicScholarshipContextType | undefined>(undefined);

export function usePublicScholarshipContext() {
  const context = useContext(PublicScholarshipContext);
  if (context === undefined) {
    throw new Error('usePublicScholarshipContext must be used within a PublicScholarshipProvider');
  }
  return context;
}

interface PublicScholarshipProviderProps {
  children: ReactNode;
}

export function PublicScholarshipProvider({ children }: PublicScholarshipProviderProps) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarships = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const { data, error: fetchError } = await getActiveScholarships();
      
      if (fetchError) {
        setError('Failed to load scholarships. Please ensure the database is configured.');
        console.error('Error fetching active scholarships:', fetchError);
        setScholarships([]);
      } else {
        setScholarships(data || []);
        setError(null);
      }
    } catch (err) {
      setError('Unable to connect to database. Please check your configuration.');
      console.error('Unexpected error:', err);
      setScholarships([]);
    }
    
    if (!isBackgroundRefresh) {
      setLoading(false);
    } else {
      setIsRefreshing(false);
    }
  };

  const refreshScholarships = async () => {
    // If we already have data, do a background refresh
    if (scholarships.length > 0) {
      await fetchScholarships(true);
    } else {
      await fetchScholarships(false);
    }
  };

  const getScholarshipFromCache = (id: string): Scholarship | undefined => {
    return scholarships.find(s => s.id === id);
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const value: PublicScholarshipContextType = {
    scholarships,
    loading,
    isRefreshing,
    error,
    refreshScholarships,
    getScholarshipFromCache,
  };

  return (
    <PublicScholarshipContext.Provider value={value}>
      {children}
    </PublicScholarshipContext.Provider>
  );
}