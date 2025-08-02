// Database Types for RRLC Scholarship Management System

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  preferred_name: string | null;
  role: 'admin' | 'applicant' | 'reviewer';
  phone: string | null;
  bio: string | null;
  location: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  notification_preferences: {
    email_notifications: boolean;
    application_updates: boolean;
    scholarship_announcements: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  name: string;
  description: string | null;
  extended_description?: string | null;
  amount: number | null;
  deadline: string | null;
  requirements: string | null;
  eligibility_criteria?: any[] | null;
  tags?: string[] | null;
  custom_fields?: CustomField[] | null; // Legacy - will be migrated to form_schema
  form_schema?: FormSchema | null; // New dynamic form structure
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CustomField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[]; // for select type
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  acceptedFormats?: string[]; // for file type
  maxSize?: number; // for file type in bytes
}

// New form schema types for fully customizable forms
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[]; // for select type
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  acceptedFormats?: string[]; // for file type
  maxSize?: number; // for file type in bytes
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  order: number;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
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
  
  // Custom Field Responses
  custom_responses?: Record<string, any> | null;
  
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

export interface Document {
  id: string;
  application_id: string;
  field_name: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_type: 'conference' | 'workshop' | 'networking' | 'award_ceremony' | 'other';
  capacity: number;
  current_registrations: number;
  status: 'active' | 'inactive' | 'cancelled' | 'completed';
  location: string | null;
  registration_fee: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_status: 'registered' | 'cancelled' | 'attended' | 'no_show';
  payment_status: 'pending' | 'paid' | 'refunded' | 'waived';
  registration_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

export interface EventWithRegistrations extends Event {
  registrations: EventRegistration[];
}

export interface EventRegistrationWithDetails extends EventRegistration {
  event: Event;
  user: Profile;
}

// Form types for creating/updating
export interface CreateScholarshipData {
  name: string;
  description?: string;
  amount?: number;
  deadline?: string;
  requirements?: string;
  status?: 'active' | 'inactive' | 'closed';
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
  
  // Custom field responses
  custom_responses?: Record<string, any>;
  
  // Additional fields from services
  date_of_birth?: string;
  academic_level?: 'high_school' | 'undergraduate' | 'graduate' | 'other';
  why_deserve_scholarship?: string;
  work_experience?: string;
  extracurricular_activities?: string;
  awards_and_honors?: string;
  status?: 'draft' | 'submitted';
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  id: string;
  status?: Application['status'];
  awarded_amount?: number;
  awarded_date?: string;
  admin_notes?: string;
}

export interface CreateEventData {
  name: string;
  description?: string;
  event_date: string;
  event_type?: Event['event_type'];
  capacity?: number;
  location?: string;
  registration_fee?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface CreateEventRegistrationData {
  event_id: string;
  user_id: string;
  registration_status?: EventRegistration['registration_status'];
  payment_status?: EventRegistration['payment_status'];
  notes?: string;
}

export interface UpdateEventRegistrationData extends Partial<CreateEventRegistrationData> {
  id: string;
}

// Profile form types
export interface UpdateProfileData {
  full_name?: string;
  preferred_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  date_of_birth?: string;
  linkedin_url?: string;
  website_url?: string;
  notification_preferences?: {
    email_notifications: boolean;
    application_updates: boolean;
    scholarship_announcements: boolean;
  };
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
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>>;
      };
      event_registrations: {
        Row: EventRegistration;
        Insert: Omit<EventRegistration, 'id' | 'created_at' | 'updated_at' | 'registration_date'>;
        Update: Partial<Omit<EventRegistration, 'id' | 'created_at' | 'updated_at' | 'registration_date'>>;
      };
    };
  };
}