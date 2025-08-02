import { supabase } from './supabaseClient';
import { Profile, UpdateProfileData } from '@/types/database';

// Profile management functions
export const ProfileService = {
  // Get user profile by ID
  async getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error: 'Failed to fetch profile' };
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: 'Failed to update profile' };
    }
  },

  // Upload avatar image
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: 'File size must be less than 5MB' };
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'File must be an image' };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      await supabase.storage
        .from('avatars')
        .remove([fileName]);

      // Upload new avatar
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        return { url: null, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating avatar URL:', updateError);
        return { url: null, error: 'Failed to update profile with new avatar' };
      }

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { url: null, error: 'Failed to upload avatar' };
    }
  },

  // Remove avatar
  async removeAvatar(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) {
        console.error('Error removing avatar URL:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error removing avatar:', error);
      return { success: false, error: 'Failed to remove avatar' };
    }
  },

  // Generate initials from name for default avatar
  getInitials(fullName: string | null, preferredName: string | null): string {
    const name = preferredName || fullName || '';
    const names = name.trim().split(' ');
    
    if (names.length === 0 || names[0] === '') {
      return 'U'; // Default for unknown
    }
    
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  },

  // Validate profile data
  validateProfileData(data: UpdateProfileData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate phone number format
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate bio length
    if (data.bio && data.bio.length > 300) {
      errors.bio = 'Bio must be 300 characters or less';
    }

    // Validate LinkedIn URL
    if (data.linkedin_url && !data.linkedin_url.match(/^https?:\/\/.*linkedin\.com.*/)) {
      errors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }

    // Validate website URL
    if (data.website_url && !data.website_url.match(/^https?:\/\/.*/)) {
      errors.website_url = 'Please enter a valid website URL (must start with http:// or https://)';
    }

    // Validate date of birth (not in future)
    if (data.date_of_birth) {
      const birthDate = new Date(data.date_of_birth);
      const today = new Date();
      if (birthDate > today) {
        errors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format date for display
  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  },

  // Format date for input
  formatDateForInput(dateString: string | null): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
};