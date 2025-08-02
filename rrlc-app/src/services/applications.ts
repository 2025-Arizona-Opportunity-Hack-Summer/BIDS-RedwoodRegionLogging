import { supabase } from '@/lib/supabaseClient';
import { sendApplicationConfirmationEmail } from '@/services/emailClient';
import { CreateApplicationData } from '@/types/database';

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
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Set applicant_id and submission details
    const dataWithApplicant = {
      ...applicationData,
      applicant_id: user.id,
      status: 'submitted' as const,
      submission_date: new Date().toISOString(),
    };

    // Check if there's an existing draft to update
    const { data: existingDraft, error: findError } = await supabase
      .from('applications')
      .select('id')
      .eq('scholarship_id', applicationData.scholarship_id)
      .eq('applicant_id', user.id)
      .eq('status', 'draft')
      .maybeSingle();

    let result;
    if (existingDraft) {
      // Update existing draft to submitted
      result = await supabase
        .from('applications')
        .update(dataWithApplicant)
        .eq('id', existingDraft.id)
        .select()
        .single();
    } else {
      // Create new submitted application
      result = await supabase
        .from('applications')
        .insert([dataWithApplicant])
        .select()
        .single();
    }

    const { data, error } = result;

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

// Save application as draft with upsert logic
export async function saveApplicationDraft(applicationData: CreateApplicationData) {
  try {
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Set applicant_id
    const dataWithApplicant = {
      ...applicationData,
      applicant_id: user.id,
      status: 'draft' as const,
      updated_at: new Date().toISOString(),
    };

    // First, try to find existing draft
    const { data: existingDraft, error: findError } = await supabase
      .from('applications')
      .select('id')
      .eq('scholarship_id', applicationData.scholarship_id)
      .eq('applicant_id', user.id)
      .eq('status', 'draft')
      .maybeSingle();

    if (findError) {
      console.error('Error finding existing draft:', findError);
      return { data: null, error: findError };
    }

    let result;
    if (existingDraft) {
      // Update existing draft
      result = await supabase
        .from('applications')
        .update(dataWithApplicant)
        .eq('id', existingDraft.id)
        .select()
        .single();
    } else {
      // Create new draft
      result = await supabase
        .from('applications')
        .insert([dataWithApplicant])
        .select()
        .single();
    }

    return { data: result.data, error: result.error };
  } catch (error) {
    console.error('Error saving application draft:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
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

// Load existing draft for a scholarship
export async function loadApplicationDraft(scholarshipId: string) {
  try {
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('scholarship_id', scholarshipId)
      .eq('applicant_id', user.id)
      .eq('status', 'draft')
      .maybeSingle();

    return { data, error };
  } catch (error) {
    console.error('Error loading application draft:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}