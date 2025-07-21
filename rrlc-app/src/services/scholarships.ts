import { supabase } from '@/lib/supabaseClient';
import { Scholarship, CreateScholarshipData, UpdateScholarshipData } from '@/types/database';

// Get all scholarships (admin view)
export async function getAllScholarships(): Promise<{ data: Scholarship[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return { data: null, error };
  }
}

// Get active scholarships (public view)
export async function getActiveScholarships(): Promise<{ data: Scholarship[] | null; error: any }> {
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

    return { data: data || [], error };
  } catch (error) {
    console.error('Error fetching active scholarships:', error);
    return { data: [], error: null };
  }
}

// Get single scholarship by ID
export async function getScholarshipById(id: string): Promise<{ data: Scholarship | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return { data: null, error };
  }
}

// Create new scholarship
export async function createScholarship(scholarshipData: CreateScholarshipData): Promise<{ data: Scholarship | null; error: any }> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('scholarships')
      .insert([{
        ...scholarshipData,
        created_by: user.id
      }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return { data: null, error };
  }
}

// Update existing scholarship
export async function updateScholarship(scholarshipData: UpdateScholarshipData): Promise<{ data: Scholarship | null; error: any }> {
  try {
    const { id, ...updateData } = scholarshipData;
    
    const { data, error } = await supabase
      .from('scholarships')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating scholarship:', error);
    return { data: null, error };
  }
}

// Soft delete scholarship (set status to inactive)
export async function deleteScholarship(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('scholarships')
      .update({ status: 'inactive' })
      .eq('id', id);

    return { success: !error, error };
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return { success: false, error };
  }
}

// Hard delete scholarship (only for testing - remove in production)
export async function hardDeleteScholarship(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('scholarships')
      .delete()
      .eq('id', id);

    return { success: !error, error };
  } catch (error) {
    console.error('Error hard deleting scholarship:', error);
    return { success: false, error };
  }
}

// Search scholarships
export async function searchScholarships(query: string): Promise<{ data: Scholarship[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,requirements.ilike.%${query}%`)
      .eq('status', 'active')
      .order('deadline', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('Error searching scholarships:', error);
    return { data: null, error };
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
  error: any 
}> {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('status, amount');

    if (error) return { data: null, error };

    const stats = {
      total: data.length,
      active: data.filter(s => s.status === 'active').length,
      inactive: data.filter(s => s.status === 'inactive').length,
      totalAmount: data.reduce((sum, s) => sum + (s.amount || 0), 0)
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching scholarship stats:', error);
    return { data: null, error };
  }
}