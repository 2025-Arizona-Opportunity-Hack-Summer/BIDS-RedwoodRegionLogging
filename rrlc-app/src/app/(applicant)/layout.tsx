"use client";

import { ApplicantSidebar, useApplicantSidebarState } from '@/components/applicant/ApplicantSidebar';

function ApplicantLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useApplicantSidebarState();

  return (
    <div className="min-h-screen bg-accent">
      <ApplicantSidebar />
      
      {/* Main Content Area */}
      <div 
        className={`
          transition-all duration-300 ease-in-out min-h-screen pt-16
          lg:ml-56 ${isCollapsed ? 'lg:ml-14' : 'lg:ml-56'}
        `}
      >
        {children}
      </div>
    </div>
  );
}

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicantLayoutContent>
      {children}
    </ApplicantLayoutContent>
  );
}