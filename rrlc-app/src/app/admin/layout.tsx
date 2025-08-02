"use client";

import { AdminProvider } from '@/contexts/AdminContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AdminSidebar, useSidebarState } from '@/components/admin/AdminSidebar';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarState();

  return (
    <div className="min-h-screen bg-accent">
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div 
        className={`
          transition-all duration-300 ease-in-out min-h-screen pt-16
          ${isCollapsed ? 'lg:ml-14' : 'lg:ml-56'}
        `}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminProvider>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </AdminProvider>
    </SidebarProvider>
  );
}