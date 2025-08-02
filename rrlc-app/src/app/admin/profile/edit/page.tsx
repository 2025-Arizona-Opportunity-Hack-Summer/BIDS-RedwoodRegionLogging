'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileService } from '@/lib/profile';
import { Profile } from '@/types/database';

function EditAdminProfilePageContent() {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(authProfile);
  const [loading, setLoading] = useState(!authProfile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authProfile && user) {
      // Fetch fresh profile data if not available in auth context
      const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await ProfileService.getProfile(user.id);
        
        if (error) {
          setError(error);
        } else if (data) {
          setProfile(data);
        }
        
        setLoading(false);
      };

      fetchProfile();
    } else if (authProfile) {
      setProfile(authProfile);
      setLoading(false);
    }
  }, [user, authProfile]);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    // You might want to update the auth context here as well
    // if your auth context supports updating the profile
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="alert alert-error mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      <ProfileForm
        profile={profile}
        onUpdate={handleProfileUpdate}
        cancelPath="/admin/profile"
      />
    </div>
  );
}

export default function EditAdminProfilePage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <EditAdminProfilePageContent />
    </ProtectedRoute>
  );
}