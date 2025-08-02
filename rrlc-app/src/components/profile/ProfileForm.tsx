'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, UpdateProfileData } from '@/types/database';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from './AvatarUpload';
import { ProfileService } from '@/lib/profile';

interface ProfileFormProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
  cancelPath: string;
}

export function ProfileForm({ profile, onUpdate, cancelPath }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateProfileData>({
    full_name: profile.full_name || '',
    preferred_name: profile.preferred_name || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    location: profile.location || '',
    date_of_birth: profile.date_of_birth || '',
    linkedin_url: profile.linkedin_url || '',
    website_url: profile.website_url || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState(profile.avatar_url);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleAvatarUpdate = (url: string | null) => {
    setCurrentAvatar(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Validate form data
    const validation = ProfileService.validateProfileData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await ProfileService.updateProfile(profile.id, formData);
      
      if (error) {
        setSubmitError(error);
      } else if (data) {
        // Update the profile with the new avatar URL if it changed
        const updatedProfile = { ...data, avatar_url: currentAvatar };
        onUpdate(updatedProfile);
        router.push(cancelPath);
      }
    } catch (err) {
      setSubmitError('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bioCharCount = formData.bio?.length || 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Edit Profile</h1>
        <p className="text-gray-600 mt-1">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-primary">Profile Photo</h2>
          </div>
          <div className="card-body">
            <AvatarUpload
              currentAvatar={currentAvatar}
              fullName={formData.full_name}
              preferredName={formData.preferred_name}
              userId={profile.id}
              onAvatarUpdate={handleAvatarUpdate}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-primary">Basic Information</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter your full name"
                />
                {errors.full_name && <p className="text-error text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label htmlFor="preferred_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Name
                </label>
                <input
                  type="text"
                  id="preferred_name"
                  name="preferred_name"
                  value={formData.preferred_name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="What would you like to be called?"
                />
                {errors.preferred_name && <p className="text-error text-sm mt-1">{errors.preferred_name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  className="input bg-gray-50"
                  disabled
                  readOnly
                />
                <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="City, State/Province, Country"
                />
                {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={ProfileService.formatDateForInput(formData.date_of_birth || null)}
                  onChange={handleInputChange}
                  className="input"
                />
                {errors.date_of_birth && <p className="text-error text-sm mt-1">{errors.date_of_birth}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="textarea"
                placeholder="Tell us a bit about yourself..."
                maxLength={300}
              />
              <div className="flex justify-between mt-1">
                {errors.bio && <p className="text-error text-sm">{errors.bio}</p>}
                <p className="text-gray-500 text-sm ml-auto">
                  {bioCharCount}/300 characters
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-primary">Professional Links</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {errors.linkedin_url && <p className="text-error text-sm mt-1">{errors.linkedin_url}</p>}
              </div>

              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Website
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="https://yourwebsite.com"
                />
                {errors.website_url && <p className="text-error text-sm mt-1">{errors.website_url}</p>}
              </div>
            </div>
          </div>
        </div>


        {/* Submit Error */}
        {submitError && (
          <div className="alert alert-error">
            {submitError}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelPath)}
            disabled={isSubmitting}
            className="btn-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="btn-primary btn-md"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}