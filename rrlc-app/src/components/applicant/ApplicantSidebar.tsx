"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiBook, 
  FiFileText, 
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
    href: '/home',
    icon: FiHome,
    description: 'Overview and quick actions'
  },
  {
    id: 'scholarships',
    label: 'Browse Scholarships',
    href: '/scholarships',
    icon: FiBook,
    description: 'Discover opportunities'
  },
  {
    id: 'applications',
    label: 'My Applications',
    href: '/applications',
    icon: FiFileText,
    description: 'Track your submissions'
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: FiUser,
    description: 'Account settings'
  }
];

interface ApplicantSidebarProps {
  className?: string;
}

export function ApplicantSidebar({ className = '' }: ApplicantSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('applicant-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('applicant-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

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
    if (href === '/home') {
      return pathname === '/home';
    }
    if (href === '/scholarships') {
      return pathname.startsWith('/scholarships');
    }
    if (href === '/applications') {
      return pathname.startsWith('/applications');
    }
    if (href === '/profile') {
      return pathname.startsWith('/profile');
    }
    return pathname === href;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            Student Portal
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
                      {item.description && (
                        <span className="text-xs opacity-75 truncate block">
                          {item.description}
                        </span>
                      )}
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
export function useApplicantSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('applicant-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  return { isCollapsed };
}