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
export async function submitApplication(applicationData: CreateApplicationData, isEditMode: boolean = false) {
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

    // Check if there's an existing application to update
    let query = supabase
      .from('applications')
      .select('id')
      .eq('scholarship_id', applicationData.scholarship_id)
      .eq('applicant_id', user.id);
    
    if (!isEditMode) {
      // In normal mode, only look for drafts
      query = query.eq('status', 'draft');
    }
    // In edit mode, find any existing application
    
    const { data: existingApplication, error: findError } = await query.maybeSingle();

    let result;
    if (existingApplication) {
      // Update existing application (draft or submitted)
      result = await supabase
        .from('applications')
        .update(dataWithApplicant)
        .eq('id', existingApplication.id)
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
      .maybeSingle();

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

// Get user's application for a specific scholarship (any status)
export async function getUserApplicationForScholarship(scholarshipId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('scholarship_id', scholarshipId)
      .eq('applicant_id', user.id)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    console.error('Error fetching user application:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Get all applications for the current user
export async function getUserApplications() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        scholarship:scholarships (
          id,
          name,
          description,
          amount,
          deadline
        )
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Get user applications mapped by scholarship ID for efficient lookup
export async function getUserApplicationsMap() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('applications')
      .select('scholarship_id, id, status')
      .eq('applicant_id', user.id);

    if (error) {
      return { data: null, error };
    }

    // Convert to map for O(1) lookup
    const applicationsMap = new Map();
    data?.forEach(app => {
      applicationsMap.set(app.scholarship_id, {
        id: app.id,
        status: app.status
      });
    });

    return { data: applicationsMap, error: null };
  } catch (error) {
    console.error('Error fetching user applications map:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Revoke/delete an application
export async function revokeApplication(applicationId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify the application belongs to the current user before deleting
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('applicant_id')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return { success: false, error: 'Application not found' };
    }

    if (application.applicant_id !== user.id) {
      return { success: false, error: 'Unauthorized to delete this application' };
    }

    // Delete the application
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error revoking application:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}