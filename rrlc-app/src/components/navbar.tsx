"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, profile, signOut, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getHomeRoute = () => {
    if (!isAuthenticated()) return "/";
    return isAdmin() ? "/admin" : "/home";
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

  return (
    <nav className="bg-primary text-white border-b-2 border-secondary">
      <div className="flex items-center p-4">
        <Link href={getHomeRoute()}>
          <h1 className="font-bold text-lg md:text-xl text-white hover:text-secondary cursor-pointer">
            RRLC Scholarship Portal
          </h1>
        </Link>
        
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

        {/* Mobile Navigation - Simplified */}
        <div className="absolute top-full left-0 right-0 bg-primary p-4 border-t border-primary-light z-10 md:hidden">
          <div className="flex flex-col gap-2">
            {isAuthenticated() ? (
              <>
                
                <Button 
                  size="sm" 
                  onClick={handleLogout}
                  loading={isLoggingOut}
                  disabled={isLoggingOut}
                  className="bg-primary-dark text-white hover:bg-primary-light active:scale-95 w-full"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <Link href="/login">
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
      </div>
    </nav>
  );
} 