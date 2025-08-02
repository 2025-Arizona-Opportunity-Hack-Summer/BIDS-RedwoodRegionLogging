-- Add missing application fields to applications table
-- This migration adds columns that are expected by the application form but missing from the database

-- Add additional application fields
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS work_experience TEXT,
ADD COLUMN IF NOT EXISTS extracurricular_activities TEXT,
ADD COLUMN IF NOT EXISTS awards_and_honors TEXT,
ADD COLUMN IF NOT EXISTS why_deserve_scholarship TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add comment for documentation
COMMENT ON COLUMN applications.work_experience IS 'Work experience description';
COMMENT ON COLUMN applications.extracurricular_activities IS 'Extracurricular activities description';
COMMENT ON COLUMN applications.awards_and_honors IS 'Awards and honors received';
COMMENT ON COLUMN applications.why_deserve_scholarship IS 'Why the applicant deserves the scholarship';
COMMENT ON COLUMN applications.date_of_birth IS 'Applicant date of birth';

-- Note: Run this migration in Supabase SQL editor to add the missing columns
-- These columns are expected by the application form but were missing from the original schema