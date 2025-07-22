import { useState, useEffect, useCallback } from 'react';
import { Scholarship, CreateScholarshipData, UpdateScholarshipData } from '@/types/database';
import * as scholarshipService from '@/services/scholarships';

// Hook for managing all scholarships (admin)
export function useScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await scholarshipService.getAllScholarships();
    
    if (fetchError) {
      setError('Failed to load scholarships');
      console.error('Error fetching scholarships:', fetchError);
    } else {
      setScholarships(data || []);
    }
    
    setLoading(false);
  }, []);

  const createScholarship = async (scholarshipData: CreateScholarshipData) => {
    const { data, error: createError } = await scholarshipService.createScholarship(scholarshipData);
    
    if (createError) {
      throw new Error('Failed to create scholarship');
    }
    
    // Refresh the list
    await fetchScholarships();
    return data;
  };

  const updateScholarship = async (scholarshipData: UpdateScholarshipData) => {
    const { data, error: updateError } = await scholarshipService.updateScholarship(scholarshipData);
    
    if (updateError) {
      throw new Error('Failed to update scholarship');
    }
    
    // Update local state optimistically
    setScholarships(prev => 
      prev.map(s => s.id === scholarshipData.id ? { ...s, ...scholarshipData } : s)
    );
    
    return data;
  };

  const deleteScholarship = async (id: string) => {
    const { success } = await scholarshipService.deleteScholarship(id);
    
    if (!success) {
      throw new Error('Failed to delete scholarship');
    }
    
    // Update local state optimistically
    setScholarships(prev => 
      prev.map(s => s.id === id ? { ...s, status: 'inactive' as const } : s)
    );
  };

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  return {
    scholarships,
    loading,
    error,
    fetchScholarships,
    createScholarship,
    updateScholarship,
    deleteScholarship,
  };
}

// Hook for managing active scholarships (public)
export function useActiveScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await scholarshipService.getActiveScholarships();
    
    if (fetchError) {
      setError('Failed to load scholarships');
      console.error('Error fetching active scholarships:', fetchError);
    } else {
      setScholarships(data || []);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActiveScholarships();
  }, [fetchActiveScholarships]);

  return {
    scholarships,
    loading,
    error,
    refetch: fetchActiveScholarships,
  };
}

// Hook for managing single scholarship
export function useScholarship(id: string | null) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarship = useCallback(async (scholarshipId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await scholarshipService.getScholarshipById(scholarshipId);
    
    if (fetchError) {
      setError('Failed to load scholarship');
      console.error('Error fetching scholarship:', fetchError);
    } else {
      setScholarship(data);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      fetchScholarship(id);
    } else {
      setScholarship(null);
      setLoading(false);
      setError(null);
    }
  }, [id, fetchScholarship]);

  return {
    scholarship,
    loading,
    error,
    refetch: id ? () => fetchScholarship(id) : () => {},
  };
}

// Hook for scholarship search
export function useScholarshipSearch() {
  const [results, setResults] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    const { data, error: searchError } = await scholarshipService.searchScholarships(query);
    
    if (searchError) {
      setError('Search failed');
      console.error('Error searching scholarships:', searchError);
    } else {
      setResults(data || []);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

// Hook for scholarship statistics
export function useScholarshipStats() {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    inactive: number;
    totalAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: statsError } = await scholarshipService.getScholarshipStats();
      
      if (statsError) {
        setError('Failed to load statistics');
        console.error('Error fetching scholarship stats:', statsError);
      } else {
        setStats(data);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
  };
}