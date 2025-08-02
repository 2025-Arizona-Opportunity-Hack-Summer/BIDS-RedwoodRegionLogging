"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiFileText, 
  FiBarChart, 
  FiCalendar,
  FiSettings,
  FiUser,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: FiHome
  },
  {
    id: 'scholarships',
    label: 'Scholarships',
    href: '/admin/scholarships',
    icon: FiBook
  },
  {
    id: 'applications',
    label: 'Applications',
    href: '/admin/applications',
    icon: FiFileText
  },
  {
    id: 'users',
    label: 'Users',
    href: '/admin/users',
    icon: FiUsers
  },
  {
    id: 'events',
    label: 'Events',
    href: '/admin/events',
    icon: FiCalendar
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/admin/analytics',
    icon: FiBarChart
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/admin/reports',
    icon: FiSettings
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/admin/profile',
    icon: FiUser
  }
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const { isAdminCollapsed: isCollapsed, setIsAdminCollapsed: setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            Admin Panel
          </h2>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden lg:flex items-center justify-center"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight size={18} className="text-gray-600" />
          ) : (
            <FiChevronLeft size={18} className="text-gray-600" />
          )}
        </button>
        <button
          onClick={toggleMobile}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <FiX size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                    }
                    ${isCollapsed ? 'justify-center px-2' : 'justify-start'}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon 
                    size={20} 
                    className={`
                      flex-shrink-0 transition-colors
                      ${active ? 'text-white' : 'text-gray-500'}
                    `} 
                  />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">
                        {item.label}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <FiMenu size={20} className="text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-14' : 'w-56'}
          ${className}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-56 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

// Hook to get sidebar state
export function useSidebarState() {
  const { isAdminCollapsed: isCollapsed } = useSidebar();
  return { isCollapsed };
}