'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ProfileService } from '@/lib/profile';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  fullName?: string | null;
  preferredName?: string | null;
  userId: string;
  onAvatarUpdate: (url: string | null) => void;
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  fullName,
  preferredName,
  userId,
  onAvatarUpdate,
  disabled = false
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { url, error } = await ProfileService.uploadAvatar(userId, file);
      
      if (error) {
        setError(error);
      } else if (url) {
        onAvatarUpdate(url);
      }
    } catch (err) {
      setError('Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Clear the input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    setError(null);

    try {
      const { success, error } = await ProfileService.removeAvatar(userId);
      
      if (error) {
        setError(error);
      } else if (success) {
        onAvatarUpdate(null);
      }
    } catch (err) {
      setError('Failed to remove avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const initials = ProfileService.getInitials(fullName || null, preferredName || null);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100 flex items-center justify-center">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profile avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-semibold text-gray-600">
              {initials}
            </span>
          )}
        </div>
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="btn-sm"
        >
          {isUploading ? 'Uploading...' : currentAvatar ? 'Change Photo' : 'Upload Photo'}
        </Button>
        
        {currentAvatar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading}
            className="btn-sm text-error hover:bg-error/10"
          >
            Remove
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Upload a photo to personalize your profile. JPG, PNG or GIF. Max size 5MB.
      </p>
    </div>
  );
}