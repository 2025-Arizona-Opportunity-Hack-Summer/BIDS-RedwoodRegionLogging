'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/database';

interface AuthContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'applicant') => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  
  // Helper methods
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  isAuthReady: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfileLoading(false);
        return null;
      }

      setProfileLoading(false);
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileLoading(false);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up new user
  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'applicant') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error || !data.user) {
        return { user: null, error };
      }
      // Update the existing profile with the role (profile is created by database trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role,
          full_name: fullName // Update full_name in case it wasn't set by trigger
        })
        .eq('id', data.user.id);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't fail the signup if profile update fails
      }
      
      // Sign out the user to require manual login
      await supabase.auth.signOut();
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Helper method to check if user is admin
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  // Helper method to check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Helper method to check if auth is fully ready (user + profile loaded)
  const isAuthReady = () => {
    if (!user) return true; // If no user, auth is "ready" (not authenticated)
    return !profileLoading && !!profile; // If user exists, wait for profile to load
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isAuthenticated,
    isAuthReady,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}