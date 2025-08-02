-- Run this in your Supabase SQL Editor to add form_schema support
-- Go to: Supabase Dashboard → SQL Editor → New Query

-- Step 1: Add the form_schema column
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS form_schema JSONB;

-- Step 2: Add a comment explaining the column
COMMENT ON COLUMN scholarships.form_schema IS 'JSON schema defining the complete application form structure including sections and fields';

-- Step 3: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_scholarships_form_schema 
ON scholarships USING GIN (form_schema);

-- Step 4: Set default form schema for existing scholarships (optional)
-- This will give existing scholarships the standard template
UPDATE scholarships 
SET form_schema = '{
  "sections": [
    {
      "id": "personal",
      "title": "Personal Information", 
      "description": "Tell us about yourself",
      "order": 1,
      "fields": [
        {
          "id": "first_name",
          "type": "text",
          "label": "First Name",
          "required": true,
          "order": 1,
          "validation": { "minLength": 2 }
        },
        {
          "id": "last_name", 
          "type": "text",
          "label": "Last Name",
          "required": true,
          "order": 2,
          "validation": { "minLength": 2 }
        },
        {
          "id": "email",
          "type": "email", 
          "label": "Email",
          "required": true,
          "order": 3
        },
        {
          "id": "phone",
          "type": "phone",
          "label": "Phone",
          "required": false,
          "order": 4
        },
        {
          "id": "address",
          "type": "text",
          "label": "Address", 
          "required": false,
          "order": 5
        },
        {
          "id": "city",
          "type": "text",
          "label": "City",
          "required": false, 
          "order": 6
        },
        {
          "id": "state",
          "type": "text",
          "label": "State",
          "required": false,
          "order": 7
        },
        {
          "id": "zip",
          "type": "text", 
          "label": "Zip",
          "required": false,
          "order": 8
        }
      ]
    },
    {
      "id": "academic",
      "title": "Academic Background",
      "description": "Share your educational journey", 
      "order": 2,
      "fields": [
        {
          "id": "school",
          "type": "text",
          "label": "School",
          "required": true,
          "order": 1
        },
        {
          "id": "graduation_year",
          "type": "number",
          "label": "Graduation Year", 
          "required": true,
          "order": 2,
          "validation": { "min": 2020, "max": 2035 }
        },
        {
          "id": "major",
          "type": "text",
          "label": "Major",
          "required": true,
          "order": 3
        },
        {
          "id": "gpa", 
          "type": "number",
          "label": "GPA",
          "required": false,
          "order": 4,
          "validation": { "min": 0, "max": 4 }
        },
        {
          "id": "academic_level",
          "type": "select",
          "label": "Academic Level",
          "required": true,
          "order": 5,
          "options": ["High School", "Undergraduate", "Graduate", "Doctoral", "Other"]
        }
      ]
    },
    {
      "id": "essays", 
      "title": "Essay Questions",
      "description": "Help us understand your goals and motivations",
      "order": 3,
      "fields": [
        {
          "id": "career_goals",
          "type": "textarea",
          "label": "Career Goals",
          "required": false,
          "order": 1,
          "validation": { "minLength": 50 }
        },
        {
          "id": "financial_need",
          "type": "textarea", 
          "label": "Financial Need",
          "required": false,
          "order": 2,
          "validation": { "minLength": 25 }
        },
        {
          "id": "community_involvement",
          "type": "textarea",
          "label": "Community Involvement", 
          "required": false,
          "order": 3,
          "validation": { "minLength": 25 }
        },
        {
          "id": "why_deserve_scholarship",
          "type": "textarea",
          "label": "Why do you deserve this scholarship?",
          "required": false,
          "order": 4,
          "validation": { "minLength": 25 }
        }
      ]
    }
  ]
}'::jsonb
WHERE form_schema IS NULL;

-- Step 5: Verify the migration worked
SELECT 
  id, 
  name, 
  CASE 
    WHEN form_schema IS NOT NULL THEN 'Has form_schema'
    ELSE 'No form_schema'
  END as schema_status,
  jsonb_array_length(form_schema->'sections') as section_count
FROM scholarships 
LIMIT 5;

-- Success message
SELECT 'form_schema column added successfully! Your dynamic form builder is now ready to use.' as status;