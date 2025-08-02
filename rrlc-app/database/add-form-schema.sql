-- Add form_schema column to scholarships table for fully customizable forms
-- Migration: Add Dynamic Form Schema Support

-- Add the form_schema column to store the complete form structure
ALTER TABLE scholarships 
ADD COLUMN form_schema JSONB;

-- Add comment explaining the purpose
COMMENT ON COLUMN scholarships.form_schema IS 'JSON schema defining the complete application form structure including sections and fields';

-- Create an index on form_schema for better query performance
CREATE INDEX IF NOT EXISTS idx_scholarships_form_schema 
ON scholarships USING GIN (form_schema);

-- Set default form schema for existing scholarships that don't have one
-- This will preserve backward compatibility
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
        },
        {
          "id": "date_of_birth",
          "type": "date",
          "label": "Date of Birth", 
          "required": false,
          "order": 9
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
          "options": ["high_school", "undergraduate", "graduate", "other"]
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
    },
    {
      "id": "additional",
      "title": "Additional Information",
      "description": "Share more about your experiences", 
      "order": 4,
      "fields": [
        {
          "id": "work_experience",
          "type": "textarea",
          "label": "Work Experience",
          "required": false,
          "order": 1
        },
        {
          "id": "extracurricular_activities", 
          "type": "textarea",
          "label": "Extracurricular Activities",
          "required": false,
          "order": 2
        },
        {
          "id": "awards_and_honors",
          "type": "textarea",
          "label": "Awards and Honors",
          "required": false,
          "order": 3
        }
      ]
    }
  ]
}'::jsonb
WHERE form_schema IS NULL;

-- For scholarships that have custom_fields, append them as a final section
UPDATE scholarships 
SET form_schema = jsonb_set(
  form_schema,
  '{sections}',
  form_schema->'sections' || jsonb_build_array(jsonb_build_object(
    'id', 'custom',
    'title', 'Scholarship Questions',
    'description', 'Answer questions specific to this scholarship',
    'order', 5,
    'fields', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', field->>'id',
          'type', field->>'type', 
          'label', field->>'label',
          'required', COALESCE((field->>'required')::boolean, false),
          'order', COALESCE((field->>'order')::integer, 1),
          'placeholder', field->>'placeholder',
          'options', field->'options',
          'validation', field->'validation',
          'acceptedFormats', field->'acceptedFormats',
          'maxSize', field->'maxSize'
        )
      )
      FROM jsonb_array_elements(custom_fields) AS field
    )
  ))
)
WHERE custom_fields IS NOT NULL AND jsonb_array_length(custom_fields) > 0;

-- Add a check constraint to ensure form_schema has required structure
ALTER TABLE scholarships 
ADD CONSTRAINT check_form_schema_structure 
CHECK (
  form_schema IS NULL OR (
    form_schema ? 'sections' AND 
    jsonb_typeof(form_schema->'sections') = 'array'
  )
);

-- Create a function to validate form schema structure (optional, for future use)
CREATE OR REPLACE FUNCTION validate_form_schema(schema JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic validation - can be expanded
  RETURN (
    schema ? 'sections' AND
    jsonb_typeof(schema->'sections') = 'array' AND
    jsonb_array_length(schema->'sections') > 0
  );
END;
$$ LANGUAGE plpgsql;