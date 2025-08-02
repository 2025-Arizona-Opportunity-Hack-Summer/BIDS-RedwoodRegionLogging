-- Fix Profile Constraints
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraints that have issues
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS phone_format;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS linkedin_url_format;

-- Recreate phone_format constraint for US phone numbers (XXX-XXX-XXXX format)
ALTER TABLE profiles ADD CONSTRAINT phone_format 
  CHECK (phone IS NULL OR phone ~ '^\d{3}-\d{3}-\d{4}$');

-- Update linkedin_url_format to be more flexible
-- This allows various LinkedIn URL formats including profiles, company pages, etc.
ALTER TABLE profiles ADD CONSTRAINT linkedin_url_format 
  CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://.*linkedin\.com.*');

-- Create index on avatar_url for performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);