-- Add profile fields to support comprehensive user profiles
-- Run this in your Supabase SQL Editor

-- Add additional profile fields to the existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_notifications": true, "application_updates": true, "scholarship_announcements": true}'::jsonb;

-- Create storage bucket for profile avatars (run this in Supabase dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create RLS policies for avatar storage
-- This policy allows users to upload their own avatars
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'avatars' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can view all avatars" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can update their own avatar" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'avatars' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete their own avatar" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'avatars' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Add constraints for data validation
ALTER TABLE profiles ADD CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^[\+]?[1-9][\d]{0,15}$');
ALTER TABLE profiles ADD CONSTRAINT bio_length CHECK (bio IS NULL OR char_length(bio) <= 300);
ALTER TABLE profiles ADD CONSTRAINT linkedin_url_format CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://.*linkedin\.com.*');
ALTER TABLE profiles ADD CONSTRAINT website_url_format CHECK (website_url IS NULL OR website_url ~ '^https?://.*');

-- Create function to validate notification preferences
CREATE OR REPLACE FUNCTION validate_notification_preferences(prefs JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if all required keys exist and are boolean
  RETURN (
    prefs ? 'email_notifications' AND
    prefs ? 'application_updates' AND
    prefs ? 'scholarship_announcements' AND
    jsonb_typeof(prefs->'email_notifications') = 'boolean' AND
    jsonb_typeof(prefs->'application_updates') = 'boolean' AND
    jsonb_typeof(prefs->'scholarship_announcements') = 'boolean'
  );
END;
$$ LANGUAGE plpgsql;

-- Add constraint for notification preferences
ALTER TABLE profiles ADD CONSTRAINT valid_notification_preferences 
  CHECK (notification_preferences IS NULL OR validate_notification_preferences(notification_preferences));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_name ON profiles(preferred_name);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- Update the existing profiles to have default notification preferences if they're null
UPDATE profiles 
SET notification_preferences = '{"email_notifications": true, "application_updates": true, "scholarship_announcements": true}'::jsonb
WHERE notification_preferences IS NULL;