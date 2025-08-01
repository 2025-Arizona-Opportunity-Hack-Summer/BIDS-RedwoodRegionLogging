"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Scholarship } from '@/types/database';
import { ApplicationWithDetails } from '@/types/database';
import { getAllScholarships } from '@/services/scholarships';
import { getAllApplicationsForAdmin } from '@/services/adminApplications';

interface AdminContextType {
  // Scholarship data
  scholarships: Scholarship[];
  scholarshipsLoading: boolean;
  scholarshipsRefreshing: boolean;
  scholarshipsError: string | null;
  refreshScholarships: () => Promise<void>;
  updateScholarshipInCache: (updatedScholarship: Scholarship) => void;
  removeScholarshipFromCache: (scholarshipId: string) => void;
  
  // Application data
  applications: ApplicationWithDetails[];
  applicationsLoading: boolean;
  applicationsRefreshing: boolean;
  applicationsError: string | null;
  refreshApplications: () => Promise<void>;
  updateApplicationInCache: (updatedApplication: ApplicationWithDetails) => void;
  removeApplicationFromCache: (applicationId: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}

// For backward compatibility
export const useScholarshipContext = () => {
  const context = useAdminContext();
  return {
    scholarships: context.scholarships,
    loading: context.scholarshipsLoading,
    isRefreshing: context.scholarshipsRefreshing,
    error: context.scholarshipsError,
    refreshScholarships: context.refreshScholarships,
    updateScholarshipInCache: context.updateScholarshipInCache,
    removeScholarshipFromCache: context.removeScholarshipFromCache,
  };
};

export const useAdminApplicationContext = () => {
  const context = useAdminContext();
  return {
    applications: context.applications,
    loading: context.applicationsLoading,
    isRefreshing: context.applicationsRefreshing,
    error: context.applicationsError,
    refreshApplications: context.refreshApplications,
    updateApplicationInCache: context.updateApplicationInCache,
    removeApplicationFromCache: context.removeApplicationFromCache,
  };
};

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  // Scholarship state
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(true);
  const [scholarshipsRefreshing, setScholarshipsRefreshing] = useState(false);
  const [scholarshipsError, setScholarshipsError] = useState<string | null>(null);

  // Application state
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsRefreshing, setApplicationsRefreshing] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  // Scholarship functions
  const fetchScholarships = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setScholarshipsLoading(true);
    } else {
      setScholarshipsRefreshing(true);
    }

    const { data, error } = await getAllScholarships();
    if (data) {
      setScholarships(data);
      setScholarshipsError(null);
    } else {
      setScholarshipsError(error);
    }
    
    if (!isBackgroundRefresh) {
      setScholarshipsLoading(false);
    } else {
      setScholarshipsRefreshing(false);
    }
  };

  const refreshScholarships = async () => {
    if (scholarships.length > 0) {
      await fetchScholarships(true);
    } else {
      await fetchScholarships(false);
    }
  };

  const updateScholarshipInCache = (updatedScholarship: Scholarship) => {
    setScholarships(prev => 
      prev.map(scholarship => 
        scholarship.id === updatedScholarship.id ? updatedScholarship : scholarship
      )
    );
  };

  const removeScholarshipFromCache = (scholarshipId: string) => {
    setScholarships(prev => prev.filter(scholarship => scholarship.id !== scholarshipId));
  };

  // Application functions
  const fetchApplications = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setApplicationsLoading(true);
    } else {
      setApplicationsRefreshing(true);
    }

    try {
      const { data, error: fetchError } = await getAllApplicationsForAdmin();
      
      if (fetchError) {
        setApplicationsError(fetchError);
        console.error('Error fetching applications:', fetchError);
      } else {
        setApplications(data || []);
        setApplicationsError(null);
      }
    } catch (err) {
      const errorMessage = 'Failed to load applications';
      setApplicationsError(errorMessage);
      console.error('Unexpected error:', err);
    }
    
    if (!isBackgroundRefresh) {
      setApplicationsLoading(false);
    } else {
      setApplicationsRefreshing(false);
    }
  };

  const refreshApplications = async () => {
    if (applications.length > 0) {
      await fetchApplications(true);
    } else {
      await fetchApplications(false);
    }
  };

  const updateApplicationInCache = (updatedApplication: ApplicationWithDetails) => {
    setApplications(prev => 
      prev.map(application => 
        application.id === updatedApplication.id ? updatedApplication : application
      )
    );
  };

  const removeApplicationFromCache = (applicationId: string) => {
    setApplications(prev => prev.filter(application => application.id !== applicationId));
  };

  useEffect(() => {
    // Fetch both datasets in parallel
    Promise.all([
      fetchScholarships(),
      fetchApplications()
    ]);
  }, []);

  const value: AdminContextType = {
    scholarships,
    scholarshipsLoading,
    scholarshipsRefreshing,
    scholarshipsError,
    refreshScholarships,
    updateScholarshipInCache,
    removeScholarshipFromCache,
    applications,
    applicationsLoading,
    applicationsRefreshing,
    applicationsError,
    refreshApplications,
    updateApplicationInCache,
    removeApplicationFromCache,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}