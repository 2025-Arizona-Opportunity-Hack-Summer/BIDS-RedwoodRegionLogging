-- Add academic_level column to applications table
ALTER TABLE applications 
ADD COLUMN academic_level TEXT DEFAULT 'undergraduate' 
CHECK (academic_level IN ('high_school', 'undergraduate', 'graduate', 'other'));

-- Update existing records to have a default value
UPDATE applications 
SET academic_level = 'undergraduate' 
WHERE academic_level IS NULL;