'use client';

import Link from 'next/link';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ProfileService } from '@/lib/profile';

interface ProfileViewProps {
  profile: Profile;
  editPath: string;
  showEditButton?: boolean;
}

export function ProfileView({ profile, editPath, showEditButton = true }: ProfileViewProps) {
  const initials = ProfileService.getInitials(profile.full_name, profile.preferred_name);
  const displayName = profile.preferred_name || profile.full_name || 'No name provided';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        {showEditButton && (
          <Link href={editPath}>
            <Button className="btn-primary">
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar and Basic Info */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body text-center">
              {/* Avatar */}
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100 flex items-center justify-center mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-gray-600">
                    {initials}
                  </span>
                )}
              </div>

              {/* Name and Role */}
              <h2 className="text-2xl font-semibold text-primary mb-1">
                {displayName}
              </h2>
              <div className="inline-flex items-center">
                <span className={`badge ${profile.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                  {profile.role === 'admin' ? 'Administrator' : 'Applicant'}
                </span>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 mt-1">{profile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900 mt-1">{profile.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900 mt-1">
                      {profile.date_of_birth ? ProfileService.formatDate(profile.date_of_birth) : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Links */}
            {(profile.linkedin_url || profile.website_url) && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-primary">Professional Links</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.linkedin_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-light underline mt-1 block"
                        >
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {profile.website_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Website</label>
                        <a
                          href={profile.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-light underline mt-1 block"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Account Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-primary">Account Information</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member since</label>
                    <p className="text-gray-900 mt-1">
                      {ProfileService.formatDate(profile.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last updated</label>
                    <p className="text-gray-900 mt-1">
                      {ProfileService.formatDate(profile.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}