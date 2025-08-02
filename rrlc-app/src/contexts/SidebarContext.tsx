"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isAdminCollapsed: boolean;
  setIsAdminCollapsed: (collapsed: boolean) => void;
  isApplicantCollapsed: boolean;
  setIsApplicantCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isAdminCollapsed, setIsAdminCollapsed] = useState(false);
  const [isApplicantCollapsed, setIsApplicantCollapsed] = useState(false);

  // Load admin sidebar state from localStorage on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin-sidebar-collapsed');
    if (savedAdmin !== null) {
      setIsAdminCollapsed(JSON.parse(savedAdmin));
    }
  }, []);

  // Load applicant sidebar state from localStorage on mount
  useEffect(() => {
    const savedApplicant = localStorage.getItem('applicant-sidebar-collapsed');
    if (savedApplicant !== null) {
      setIsApplicantCollapsed(JSON.parse(savedApplicant));
    }
  }, []);

  // Save admin sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isAdminCollapsed));
  }, [isAdminCollapsed]);

  // Save applicant sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('applicant-sidebar-collapsed', JSON.stringify(isApplicantCollapsed));
  }, [isApplicantCollapsed]);

  return (
    <SidebarContext.Provider 
      value={{ 
        isAdminCollapsed, 
        setIsAdminCollapsed,
        isApplicantCollapsed,
        setIsApplicantCollapsed 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}