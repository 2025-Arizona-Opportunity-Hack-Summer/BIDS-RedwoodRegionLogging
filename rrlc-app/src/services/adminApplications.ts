import { supabase } from '@/lib/supabaseClient';
import { Application } from './applications';

export interface ApplicationWithScholarship extends Application {
  scholarships: {
    name: string;
    amount: number | null;
    deadline: string | null;
  };
}

export interface ApplicationFilters {
  status?: string;
  scholarship?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Get all applications for admin review
export async function getAllApplications(filters?: ApplicationFilters) {
  try {
    let query = supabase
      .from('applications')
      .select(`
        *,
        scholarships:scholarship_id (
          name,
          amount,
          deadline
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.scholarship) {
      query = query.eq('scholarship_id', filters.scholarship);
    }
    
    if (filters?.search) {
      // Enhanced multi-field search including school, major, and combined name search
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,school.ilike.%${filters.search}%,major.ilike.%${filters.search}%`);
    }
    
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return { data: null, error };
  }
}

// Update application status
export async function updateApplicationStatus(
  id: string, 
  status: string,
  awardedAmount?: number,
  awardedDate?: string,
  notes?: string
) {
  try {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (awardedAmount !== undefined) {
      updateData.awarded_amount = awardedAmount;
    }
    
    if (awardedDate) {
      updateData.awarded_date = awardedDate;
    }

    if (notes !== undefined) {
      updateData.internal_notes = notes;
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { data: null, error };
  }
}

// Get application statistics
export async function getApplicationStats() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('status, awarded_amount, created_at');

    if (error) {
      return { data: null, error };
    }

    const stats = {
      total: data.length,
      submitted: data.filter(app => app.status === 'submitted').length,
      under_review: data.filter(app => app.status === 'under_review').length,
      approved: data.filter(app => app.status === 'approved').length,
      rejected: data.filter(app => app.status === 'rejected').length,
      awarded: data.filter(app => app.status === 'awarded').length,
      totalAwarded: data
        .filter(app => app.awarded_amount)
        .reduce((sum, app) => sum + (app.awarded_amount || 0), 0),
      thisMonth: data.filter(app => {
        const appDate = new Date(app.created_at);
        const now = new Date();
        return appDate.getMonth() === now.getMonth() && 
               appDate.getFullYear() === now.getFullYear();
      }).length
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return { data: null, error };
  }
}

// Bulk update applications
export async function bulkUpdateApplications(applicationIds: string[], updates: Record<string, unknown>) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', applicationIds)
      .select();

    return { data, error };
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    return { data: null, error };
  }
}

// Export applications to CSV data
export async function getApplicationsForExport(filters?: ApplicationFilters) {
  const { data, error } = await getAllApplications(filters);
  
  if (error || !data) {
    return { data: null, error };
  }

  const csvData = data.map((app: ApplicationWithScholarship) => ({
    'Application ID': app.id,
    'Scholarship': app.scholarships?.name || 'N/A',
    'Applicant Name': `${app.first_name} ${app.last_name}`,
    'Email': app.email,
    'Phone': app.phone,
    'City': app.city,
    'State': app.state,
    'School': app.school,
    'Major': app.major,
    'Graduation Year': app.graduation_year,
    'GPA': app.gpa || 'N/A',
    'Academic Level': app.academic_level,
    'Status': app.status,
    'Application Date': new Date(app.created_at).toLocaleDateString(),
    'Awarded Amount': app.awarded_amount ? `$${app.awarded_amount}` : 'N/A',
    'Award Date': app.awarded_date ? new Date(app.awarded_date).toLocaleDateString() : 'N/A'
  }));

  return { data: csvData, error: null };
}