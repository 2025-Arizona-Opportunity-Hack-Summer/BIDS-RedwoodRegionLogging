// Database Types for RRLC Scholarship Management System

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'applicant' | 'reviewer';
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  name: string;
  description: string | null;
  amount: number | null;
  deadline: string | null;
  requirements: string | null;
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Application {
  id: string;
  scholarship_id: string;
  applicant_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awarded';
  submission_date: string | null;
  
  // Personal Information
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  
  // Academic Information
  school: string | null;
  graduation_year: number | null;
  gpa: number | null;
  major: string | null;
  
  // Essay Responses
  career_goals: string | null;
  financial_need: string | null;
  community_involvement: string | null;
  
  // Award Information
  awarded_amount: number | null;
  awarded_date: string | null;
  admin_notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: 'transcript' | 'recommendation' | 'essay' | 'other';
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

// Extended types with relationships
export interface ApplicationWithScholarship extends Application {
  scholarship: Scholarship;
}

export interface ApplicationWithProfile extends Application {
  profile: Profile;
}

export interface ApplicationWithDetails extends Application {
  scholarship: Scholarship;
  profile: Profile;
  documents: ApplicationDocument[];
}

// Form types for creating/updating
export interface CreateScholarshipData {
  name: string;
  description?: string;
  amount?: number;
  deadline?: string;
  requirements?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateScholarshipData extends Partial<CreateScholarshipData> {
  id: string;
}

export interface CreateApplicationData {
  scholarship_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  school?: string;
  graduation_year?: number;
  gpa?: number;
  major?: string;
  career_goals?: string;
  financial_need?: string;
  community_involvement?: string;
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  id: string;
  status?: Application['status'];
  awarded_amount?: number;
  awarded_date?: string;
  admin_notes?: string;
}

// Supabase Database Type Definition
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      scholarships: {
        Row: Scholarship;
        Insert: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Application, 'id' | 'created_at' | 'updated_at'>>;
      };
      application_documents: {
        Row: ApplicationDocument;
        Insert: Omit<ApplicationDocument, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<ApplicationDocument, 'id' | 'uploaded_at'>>;
      };
    };
  };
}