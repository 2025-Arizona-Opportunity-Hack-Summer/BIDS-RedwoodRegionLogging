import { useState, useEffect, useCallback } from 'react';
import { Scholarship } from '@/types/database';
import * as scholarshipService from '@/services/scholarships';
import { isScholarshipExpired } from '@/services/scholarships';

export interface ScholarshipFilters {
  search: string;
  minAmount?: number;
  maxAmount?: number;
  deadline: 'week' | 'month' | 'quarter' | 'all';
}

// Hook for public scholarship listing (applicant view)
export function usePublicScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ScholarshipFilters>(() => {
    // Load filters from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('scholarshipFilters');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            search: parsed.search || '',
            deadline: parsed.deadline || 'all',
            minAmount: parsed.minAmount,
            maxAmount: parsed.maxAmount
          };
        }
      } catch (error) {
        console.warn('Failed to load saved filters:', error);
      }
    }
    
    return {
      search: '',
      deadline: 'all'
    };
  });

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await scholarshipService.getActiveScholarships();
      
      if (fetchError) {
        setError('Failed to load scholarships. Please ensure the database is configured.');
        console.error('Error fetching active scholarships:', fetchError);
        setScholarships([]);
      } else {
        setScholarships(data || []);
      }
    } catch (err) {
      setError('Unable to connect to database. Please check your configuration.');
      console.error('Unexpected error:', err);
      setScholarships([]);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Filter scholarships based on current filters
  const filteredScholarships = scholarships.filter(scholarship => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (
        !scholarship.name.toLowerCase().includes(searchTerm) &&
        !scholarship.description?.toLowerCase().includes(searchTerm) &&
        !scholarship.requirements?.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }

    // Amount filters
    if (filters.minAmount && scholarship.amount && scholarship.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount && scholarship.amount && scholarship.amount > filters.maxAmount) {
      return false;
    }

    // Deadline filter
    if (filters.deadline !== 'all' && scholarship.deadline) {
      const deadlineDate = new Date(scholarship.deadline);
      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.deadline) {
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
        case 'quarter':
          if (diffDays > 90) return false;
          break;
      }
    }

    return true;
  });

  const updateFilters = (newFilters: Partial<ScholarshipFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('scholarshipFilters', JSON.stringify(updated));
        } catch (error) {
          console.warn('Failed to save filters to localStorage:', error);
        }
      }
      
      return updated;
    });
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string | null): number | null => {
    if (!deadline) return null;
    if (isScholarshipExpired(deadline)) return 0;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    scholarships: filteredScholarships,
    loading,
    error,
    filters,
    updateFilters,
    refreshScholarships: fetchScholarships,
    getDaysUntilDeadline,
    totalCount: scholarships.length,
    filteredCount: filteredScholarships.length
  };
}