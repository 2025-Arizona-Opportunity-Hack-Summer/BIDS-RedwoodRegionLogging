-- Fix for user deletion issue in Supabase
-- This script updates foreign key constraints to allow cascade deletion

-- First, drop the existing foreign key constraint on profiles table
ALTER TABLE profiles 
DROP CONSTRAINT profiles_id_fkey;

-- Re-add the foreign key with ON DELETE CASCADE
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Also update the created_by reference in scholarships table if needed
ALTER TABLE scholarships 
DROP CONSTRAINT IF EXISTS scholarships_created_by_fkey;

ALTER TABLE scholarships 
ADD CONSTRAINT scholarships_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE SET NULL;

-- Update the event_registrations table as well
ALTER TABLE event_registrations 
DROP CONSTRAINT IF EXISTS event_registrations_user_id_fkey;

ALTER TABLE event_registrations 
ADD CONSTRAINT event_registrations_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Note: The applications table already has ON DELETE CASCADE for applicant_id, 
-- so it should be fine

-- Optional: If you want to manually delete a specific user and their data:
-- DELETE FROM auth.users WHERE email = 'user@example.com';