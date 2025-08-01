-- Add custom fields support to scholarships and applications
-- Run this in your Supabase SQL Editor

-- Add custom_fields column to scholarships table
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

-- Add custom_responses column to applications table  
ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_responses JSONB DEFAULT '{}'::jsonb;

-- Add extended_description column for "Learn More" functionality
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS extended_description TEXT;

-- Add eligibility_criteria column
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS eligibility_criteria JSONB DEFAULT '[]'::jsonb;

-- Add tags for categorization
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create documents table for file uploads
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for documents
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);

-- Enable RLS for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents
CREATE POLICY "Users can view documents for their own applications" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = documents.application_id 
      AND applications.applicant_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents for their own applications" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = documents.application_id 
      AND applications.applicant_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Sample custom field structure for reference
/*
custom_fields: [
  {
    id: "field_1",
    type: "text", // text, textarea, number, date, select, checkbox, file
    label: "Parent/Guardian Name",
    placeholder: "Enter full name",
    required: true,
    order: 1,
    options: [], // for select type
    validation: {
      minLength: 2,
      maxLength: 100
    }
  },
  {
    id: "field_2", 
    type: "select",
    label: "Grade Level",
    required: true,
    order: 2,
    options: ["9th Grade", "10th Grade", "11th Grade", "12th Grade"]
  },
  {
    id: "field_3",
    type: "file",
    label: "Letter of Recommendation",
    required: false,
    order: 3,
    acceptedFormats: [".pdf", ".doc", ".docx"],
    maxSize: 5242880 // 5MB in bytes
  }
]
*/

-- Sample custom_responses structure
/*
custom_responses: {
  "field_1": "John Doe",
  "field_2": "11th Grade",
  "field_3": "document_id_here"
}
*/