"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiHome, FiBook, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [applicantSidebarCollapsed, setApplicantSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const getAdminSidebarState = () => {
      const saved = localStorage.getItem('admin-sidebar-collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    };

    const getApplicantSidebarState = () => {
      const saved = localStorage.getItem('applicant-sidebar-collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    };

    setSidebarCollapsed(getAdminSidebarState());
    setApplicantSidebarCollapsed(getApplicantSidebarState());

    // Listen for localStorage changes (when sidebar state changes)
    const handleStorageChange = () => {
      setSidebarCollapsed(getAdminSidebarState());
      setApplicantSidebarCollapsed(getApplicantSidebarState());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes since localStorage events don't fire in the same tab
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getHomeRoute = () => {
    if (!isAuthenticated()) return "/";
    return isAdmin() ? "/admin" : "/dashboard";
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (!error) {
        // Small delay to ensure auth state updates
        setTimeout(() => {
          setIsLoggingOut(false); // Reset loading state
          router.push("/login");
        }, 100);
      } else {
        console.error('Logout error:', error);
        // Reset state on error so user can try again
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Navigation items for applicant users
  const applicantNavItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: FiHome,
      active: pathname === '/dashboard'
    },
    {
      href: '/scholarships',
      label: 'Browse Scholarships',
      icon: FiBook,
      active: pathname.startsWith('/scholarships')
    },
    {
      href: '/dashboard/applications',
      label: 'My Applications',
      icon: FiFileText,
      active: pathname.startsWith('/dashboard/applications')
    }
  ];

  const showApplicantNavigation = false; // Remove applicant navigation from navbar
  const isAdminPage = pathname.startsWith('/admin');
  const isApplicantPage = isAuthenticated() && !isAdmin() && (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile')
  );

  // Calculate navbar positioning based on sidebar state
  const getNavbarStyle = () => {
    if (isAdminPage) {
      const sidebarWidth = sidebarCollapsed ? '3.5rem' : '14rem'; // w-14 = 3.5rem, w-56 = 14rem
      return {
        width: `calc(100vw - ${sidebarWidth})`,
        left: sidebarWidth
      };
    }
    
    if (isApplicantPage) {
      const sidebarWidth = applicantSidebarCollapsed ? '3.5rem' : '14rem'; // w-14 = 3.5rem, w-56 = 14rem
      return {
        width: `calc(100vw - ${sidebarWidth})`,
        left: sidebarWidth
      };
    }
    
    return undefined;
  };

  return (
    <nav className={`bg-primary text-white border-b-2 border-secondary transition-all duration-300 ease-in-out ${
      (isAdminPage || isApplicantPage)
        ? 'fixed top-0 z-40 w-full lg:w-auto left-0' 
        : ''
    }`}
         style={(isAdminPage || isApplicantPage) ? getNavbarStyle() : undefined}>
      <div className="flex items-center p-4">
        <Link href={getHomeRoute()}>
          <h1 className="font-bold text-lg md:text-xl text-white hover:text-secondary cursor-pointer">
            RRLC Scholarship Portal
          </h1>
        </Link>
        
        {/* Applicant Navigation (Desktop) */}
        {showApplicantNavigation && (
          <div className="hidden md:flex items-center ml-8 gap-6">
            {applicantNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                    ${item.active 
                      ? 'bg-primary-light text-white shadow-sm' 
                      : 'text-secondary hover:bg-primary-light hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
        
        <div className="flex-1" />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated() ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary">
                  {profile?.full_name || user?.email}
                </span>
                {profile?.role && (
                  <span className="badge badge-secondary capitalize text-xs">
                    {profile.role}
                  </span>
                )}
              </div>
              
              <Button 
                size="sm" 
                onClick={handleLogout}
                loading={isLoggingOut}
                disabled={isLoggingOut}
                className="bg-primary-dark text-white hover:bg-primary-light active:scale-95"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button 
                size="sm"
                className="bg-primary-dark text-white hover:bg-primary-light"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle - Only show for non-sidebar pages */}
        {!isAdminPage && !isApplicantPage && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary-light transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <FiX size={20} className="text-white" />
            ) : (
              <FiMenu size={20} className="text-white" />
            )}
          </button>
        )}
      </div>

      {/* Mobile Navigation Menu - Only show for non-sidebar pages */}
      {!isAdminPage && !isApplicantPage && isMobileMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-light">
          <div className="p-4 space-y-3">
            {/* User Info */}
            {isAuthenticated() && (
              <div className="pb-3 border-b border-primary-light">
                <div className="text-sm text-secondary">
                  {profile?.full_name || user?.email}
                </div>
                {profile?.role && (
                  <div className="text-xs text-secondary-light capitalize mt-1">
                    {profile.role}
                  </div>
                )}
              </div>
            )}

            {/* Applicant Navigation (Mobile) */}
            {showApplicantNavigation && (
              <div className="space-y-2 pb-3 border-b border-primary-light">
                {applicantNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full
                        ${item.active 
                          ? 'bg-primary-light text-white shadow-sm' 
                          : 'text-secondary hover:bg-primary-light hover:text-white'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Logout/Login Button */}
            {isAuthenticated() ? (
              <Button 
                size="sm" 
                onClick={handleLogout}
                loading={isLoggingOut}
                disabled={isLoggingOut}
                className="bg-primary-dark text-white hover:bg-primary-light active:scale-95 w-full"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  size="sm"
                  className="bg-primary-dark text-white hover:bg-primary-light w-full"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 