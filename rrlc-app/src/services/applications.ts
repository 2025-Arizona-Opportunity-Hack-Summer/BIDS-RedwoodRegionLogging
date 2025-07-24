import { supabase } from '@/lib/supabaseClient';
import { sendApplicationConfirmationEmail } from '@/services/emailClient';

export interface CreateApplicationData {
  scholarship_id: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  date_of_birth?: string;

  // Academic Information
  school: string;
  graduation_year: number;
  gpa?: number;
  major: string;
  academic_level: 'high_school' | 'undergraduate' | 'graduate' | 'other';

  // Essay Responses
  career_goals?: string;
  financial_need?: string;
  community_involvement?: string;
  why_deserve_scholarship?: string;

  // Additional Information
  work_experience?: string;
  extracurricular_activities?: string;
  awards_and_honors?: string;
  
  status?: 'draft' | 'submitted';
}

export interface Application extends CreateApplicationData {
  id: string;
  applicant_id?: string;
  submission_date?: string;
  awarded_amount?: number;
  awarded_date?: string;
  created_at: string;
  updated_at: string;
}

// Submit a new application
export async function submitApplication(applicationData: CreateApplicationData) {
  try {
    // First, submit the application
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        ...applicationData,
        status: 'submitted',
        submission_date: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Then, fetch the scholarship details for the email
    const { data: scholarship, error: scholarshipError } = await supabase
      .from('scholarships')
      .select('name')
      .eq('id', applicationData.scholarship_id)
      .single();

    if (!scholarshipError && scholarship && data) {
      // Send confirmation email (non-blocking)
      const applicantName = `${applicationData.first_name} ${applicationData.last_name}`;
      sendApplicationConfirmationEmail(
        applicationData.email,
        applicantName,
        scholarship.name,
        data.id
      ).catch(emailError => {
        // Log email error but don't fail the application submission
        console.error('Failed to send confirmation email:', emailError);
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { data: null, error };
  }
}

// Save application as draft
export async function saveApplicationDraft(applicationData: CreateApplicationData) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        ...applicationData,
        status: 'draft',
      }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error saving application draft:', error);
    return { data: null, error };
  }
}

// Update existing application
export async function updateApplication(id: string, applicationData: Partial<CreateApplicationData>) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({
        ...applicationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating application:', error);
    return { data: null, error };
  }
}

// Get application by ID
export async function getApplicationById(id: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, scholarships(name, amount, deadline)')
      .eq('id', id)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching application:', error);
    return { data: null, error };
  }
}

// Check if user has already applied for a scholarship
export async function checkExistingApplication(scholarshipId: string, email: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id, status')
      .eq('scholarship_id', scholarshipId)
      .eq('email', email)
      .single();

    return { data, error };
  } catch {
    // No existing application found is expected, so we return null
    return { data: null, error: null };
  }
}