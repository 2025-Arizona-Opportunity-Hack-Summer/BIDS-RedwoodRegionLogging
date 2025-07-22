-- RRLC Admin Role Setup Script
-- Run this in your Supabase SQL Editor to enable admin access for testing

-- 1. First, find your user ID by running this query with your email:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- 2. Then update the profiles table to set admin role
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from step 1

-- Example: Update user role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID_HERE';

-- Alternative: If you want to make the first registered user an admin automatically:
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM profiles 
  ORDER BY created_at 
  LIMIT 1
);

-- Verify the change:
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';

-- Additional: Create a test admin user (optional)
-- First create the user in Supabase Auth dashboard, then run:
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES ('USER_ID_FROM_AUTH', 'admin@rrlc.test', 'Test Admin', 'admin');