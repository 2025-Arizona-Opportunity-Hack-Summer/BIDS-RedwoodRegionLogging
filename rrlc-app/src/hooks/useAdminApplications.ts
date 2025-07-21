import { useState, useEffect, useCallback } from 'react';
import { ApplicationWithScholarship, ApplicationFilters } from '@/services/adminApplications';
import * as adminApplicationService from '@/services/adminApplications';

export function useAdminApplications() {
  const [applications, setApplications] = useState<ApplicationWithScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({});

  const fetchApplications = useCallback(async (currentFilters?: ApplicationFilters) => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await adminApplicationService.getAllApplications(
      currentFilters || filters
    );
    
    if (fetchError) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', fetchError);
    } else {
      setApplications(data || []);
    }
    
    setLoading(false);
  }, [filters]);

  const fetchStats = useCallback(async () => {
    const { data, error: statsError } = await adminApplicationService.getApplicationStats();
    
    if (statsError) {
      console.error('Error fetching stats:', statsError);
    } else {
      setStats(data);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [fetchApplications, fetchStats]);

  const updateApplicationStatus = useCallback(async (
    id: string,
    status: string,
    awardedAmount?: number,
    awardedDate?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await adminApplicationService.updateApplicationStatus(
        id,
        status,
        awardedAmount,
        awardedDate,
        notes
      );
      
      if (error) {
        throw new Error('Failed to update application');
      }
      
      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, ...data }
            : app
        )
      );
      
      // Refresh stats
      fetchStats();
      
      return { success: true, data };
    } catch (error) {
      console.error('Error updating application:', error);
      return { success: false, error };
    }
  }, [fetchStats]);

  const bulkUpdateApplications = useCallback(async (
    applicationIds: string[],
    updates: any
  ) => {
    try {
      const { data, error } = await adminApplicationService.bulkUpdateApplications(
        applicationIds,
        updates
      );
      
      if (error) {
        throw new Error('Failed to bulk update applications');
      }
      
      // Refresh the applications list
      await fetchApplications();
      await fetchStats();
      
      return { success: true, data };
    } catch (error) {
      console.error('Error bulk updating applications:', error);
      return { success: false, error };
    }
  }, [fetchApplications, fetchStats]);

  const updateFilters = useCallback((newFilters: ApplicationFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const applyFilters = useCallback(async () => {
    await fetchApplications(filters);
  }, [filters, fetchApplications]);

  const exportApplications = useCallback(async () => {
    try {
      const { data, error } = await adminApplicationService.getApplicationsForExport(filters);
      
      if (error) {
        throw new Error('Failed to export applications');
      }
      
      // Convert to CSV and download
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => 
            headers.map(header => 
              `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
            ).join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `applications-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return { success: true };
      } else {
        return { success: false, error: 'No data to export' };
      }
    } catch (error) {
      console.error('Error exporting applications:', error);
      return { success: false, error };
    }
  }, [filters]);

  const getFilteredApplications = useCallback(() => {
    return applications;
  }, [applications]);

  return {
    applications: getFilteredApplications(),
    loading,
    error,
    stats,
    filters,
    updateFilters,
    applyFilters,
    updateApplicationStatus,
    bulkUpdateApplications,
    refreshApplications: fetchApplications,
    refreshStats: fetchStats,
    exportApplications,
    totalCount: applications.length
  };
}