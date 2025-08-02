import { supabase } from '@/lib/supabaseClient';
import { Scholarship, CreateScholarshipData, UpdateScholarshipData } from '@/types/database';

// Utility function to check if a scholarship is expired
export function isScholarshipExpired(deadline: string | null): boolean {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  // Set time to start of day for accurate comparison
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate < now;
}

// Utility function to validate deadline date
export function isValidDeadlineForActivation(deadline: string | null): boolean {
  if (!deadline) return true; // No deadline is valid
  const deadlineDate = new Date(deadline);
  const now = new Date();
  // Set time to start of day for accurate comparison
  now.setHours(23, 59, 59, 999); // End of today
  deadlineDate.setHours(23, 59, 59, 999);
  return deadlineDate >= now;
}

// Get all scholarships (admin view)
export async function getAllScholarships(): Promise<{ data: Scholarship[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get active scholarships (public view)
export async function getActiveScholarships(): Promise<{ data: Scholarship[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('status', 'active')
      .order('deadline', { ascending: true });

    // Return empty array if table doesn't exist or no data found
    if (error) {
      console.error('Error fetching active scholarships:', error);
      return { data: [], error: null }; // Return empty array instead of null to prevent UI crashes
    }

    // Filter out expired scholarships on the client side
    const activeNonExpiredScholarships = (data || []).filter(scholarship => 
      !isScholarshipExpired(scholarship.deadline)
    );

    return { data: activeNonExpiredScholarships, error };
  } catch (error) {
    console.error('Error fetching active scholarships:', error);
    return { data: [], error: null };
  }
}

// Get single scholarship by ID
export async function getScholarshipById(id: string): Promise<{ data: Scholarship | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Create new scholarship
export async function createScholarship(scholarshipData: any): Promise<{ data: Scholarship | null; error: string | null }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Validate deadline if status is active
    if (scholarshipData.status === 'active' && !isValidDeadlineForActivation(scholarshipData.deadline)) {
      return { 
        data: null, 
        error: 'Cannot activate scholarship with a past due date. Please set a future deadline or keep status as inactive.' 
      };
    }

    const { data, error } = await supabase
      .from('scholarships')
      .insert([{
        ...scholarshipData,
        created_by: user.id
      }])
      .select()
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Update existing scholarship
export async function updateScholarship(scholarshipData: any): Promise<{ data: Scholarship | null; error: string | null }> {
  try {
    const { id, form_schema, ...updateData } = scholarshipData;
    
    // Validate deadline if status is being set to active
    if (updateData.status === 'active' && !isValidDeadlineForActivation(updateData.deadline)) {
      return { 
        data: null, 
        error: 'Cannot activate scholarship with a past due date. Please set a future deadline or keep status as inactive.' 
      };
    }

    // Try to update with form_schema first, fallback if column doesn't exist
    const finalUpdateData = { ...updateData };
    
    // Check if form_schema should be included
    if (form_schema) {
      try {
        // First attempt: include form_schema
        finalUpdateData.form_schema = form_schema;
        
        const { data, error } = await supabase
          .from('scholarships')
          .update(finalUpdateData)
          .eq('id', id)
          .select()
          .single();

        if (error && error.message?.includes('form_schema')) {
          // If form_schema column doesn't exist, try without it
          console.warn('form_schema column not found, updating without it');
          const { form_schema: _, ...dataWithoutSchema } = finalUpdateData;
          
          const fallbackResult = await supabase
            .from('scholarships')
            .update(dataWithoutSchema)
            .eq('id', id)
            .select()
            .single();
            
          if (fallbackResult.error) {
            return { data: null, error: fallbackResult.error.message || 'Failed to update scholarship' };
          }
          
          return { 
            data: fallbackResult.data, 
            error: 'Scholarship updated successfully. Note: Advanced form builder requires database migration - please contact your administrator.' 
          };
        }

        return { data, error: error?.message || null };
      } catch (schemaError) {
        // Fallback if there's any schema-related error
        console.warn('Schema error, attempting update without form_schema:', schemaError);
        const { form_schema: _, ...dataWithoutSchema } = finalUpdateData;
        
        const { data, error } = await supabase
          .from('scholarships')
          .update(dataWithoutSchema)
          .eq('id', id)
          .select()
          .single();

        return { 
          data, 
          error: error?.message || 'Scholarship updated, but advanced form features are not available. Please contact your administrator.' 
        };
      }
    } else {
      // No form_schema to save, proceed normally
      const { data, error } = await supabase
        .from('scholarships')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .single();

      return { data, error: error?.message || null };
    }
  } catch (error) {
    console.error('Error updating scholarship:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Hard delete scholarship (permanently remove from database)
export async function deleteScholarship(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('scholarships')
      .delete()
      .eq('id', id);

    return { success: !error, error: error?.message || null };
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return { success: false, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Soft delete scholarship (set status to inactive) - for backward compatibility
export async function deactivateScholarship(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('scholarships')
      .update({ status: 'inactive' })
      .eq('id', id);

    return { success: !error, error: error?.message || null };
  } catch (error) {
    console.error('Error deactivating scholarship:', error);
    return { success: false, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}


// Search scholarships
export async function searchScholarships(query: string): Promise<{ data: Scholarship[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,requirements.ilike.%${query}%`)
      .eq('status', 'active')
      .order('deadline', { ascending: true });

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error searching scholarships:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Batch deactivate expired scholarships
export async function deactivateExpiredScholarships(): Promise<{ 
  count: number; 
  error: string | null 
}> {
  try {
    // Get all active scholarships with deadlines
    const { data: scholarships, error: fetchError } = await supabase
      .from('scholarships')
      .select('id, deadline')
      .eq('status', 'active')
      .not('deadline', 'is', null);

    if (fetchError) {
      return { count: 0, error: fetchError.message };
    }

    // Filter expired scholarships
    const expiredScholarships = (scholarships || []).filter(s => 
      isScholarshipExpired(s.deadline)
    );

    if (expiredScholarships.length === 0) {
      return { count: 0, error: null };
    }

    // Batch update to inactive status
    const expiredIds = expiredScholarships.map(s => s.id);
    const { error: updateError } = await supabase
      .from('scholarships')
      .update({ status: 'inactive' })
      .in('id', expiredIds);

    if (updateError) {
      return { count: 0, error: updateError.message };
    }

    console.log(`Automatically deactivated ${expiredScholarships.length} expired scholarships`);
    return { count: expiredScholarships.length, error: null };
  } catch (error) {
    console.error('Error deactivating expired scholarships:', error);
    return { count: 0, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get scholarship statistics
export async function getScholarshipStats(): Promise<{ 
  data: {
    total: number;
    active: number;
    inactive: number;
    totalAmount: number;
  } | null; 
  error: string | null 
}> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('status, amount');

    if (error) return { data: null, error: error.message || 'Unknown error' };

    const stats = {
      total: data.length,
      active: data.filter(s => s.status === 'active').length,
      inactive: data.filter(s => s.status === 'inactive').length,
      totalAmount: data.reduce((sum, s) => sum + (s.amount || 0), 0)
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching scholarship stats:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}