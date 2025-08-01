import { supabase } from '@/lib/supabaseClient';
import { getApplicationStats, getAllApplications } from './adminApplications';
import { getEventStats, getAllEvents, getEventRegistrations } from './events';

export interface AnalyticsData {
  overview: {
    totalApplications: number;
    totalAwarded: number;
    totalFunding: number;
    averageAward: number;
    successRate: number;
  };
  applicationTrends: {
    month: string;
    applications: number;
    awarded: number;
    funding: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  scholarshipImpact: {
    name: string;
    applications: number;
    awarded: number;
    totalFunding: number;
    successRate: number;
  }[];
  demographics: {
    schools: { name: string; count: number }[];
    majors: { name: string; count: number }[];
    states: { name: string; count: number }[];
  };
  eventAnalytics: {
    totalEvents: number;
    totalRegistrations: number;
    averageAttendance: number;
    capacityUtilization: number;
    eventTrends: {
      month: string;
      events: number;
      registrations: number;
    }[];
  };
}

export interface TimeRange {
  start: string;
  end: string;
}

// Get comprehensive analytics data
export async function getAnalyticsData(timeRange?: TimeRange): Promise<{ 
  data: AnalyticsData | null; 
  error: string | null 
}> {
  try {
    // Get all applications with scholarship data
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        scholarships:scholarship_id (
          name,
          amount
        )
      `)
      .order('created_at', { ascending: true });

    if (appError) return { data: null, error: appError.message };

    // Get all events with registration data
    const { data: events, error: eventError } = await getAllEvents();
    if (eventError) return { data: null, error: eventError };

    // Filter by time range if provided
    const filteredApps = timeRange 
      ? applications?.filter(app => {
          const appDate = new Date(app.created_at);
          return appDate >= new Date(timeRange.start) && appDate <= new Date(timeRange.end);
        }) || []
      : applications || [];

    // Calculate overview metrics
    const totalApplications = filteredApps.length;
    const awardedApps = filteredApps.filter(app => app.status === 'awarded');
    const totalAwarded = awardedApps.length;
    const totalFunding = awardedApps.reduce((sum, app) => sum + (app.awarded_amount || 0), 0);
    const averageAward = totalAwarded > 0 ? totalFunding / totalAwarded : 0;
    const successRate = totalApplications > 0 ? (totalAwarded / totalApplications) * 100 : 0;

    // Calculate monthly trends
    const monthlyData = new Map();
    filteredApps.forEach(app => {
      const date = new Date(app.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { applications: 0, awarded: 0, funding: 0 });
      }
      
      const data = monthlyData.get(monthKey);
      data.applications++;
      
      if (app.status === 'awarded') {
        data.awarded++;
        data.funding += app.awarded_amount || 0;
      }
    });

    const applicationTrends = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        ...data
      }));

    // Calculate status distribution
    const statusCounts = new Map();
    filteredApps.forEach(app => {
      statusCounts.set(app.status, (statusCounts.get(app.status) || 0) + 1);
    });

    const statusDistribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status: status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count,
      percentage: totalApplications > 0 ? (count / totalApplications) * 100 : 0
    }));

    // Calculate scholarship impact
    const scholarshipData = new Map();
    filteredApps.forEach(app => {
      const scholarshipName = app.scholarships?.name || 'Unknown';
      
      if (!scholarshipData.has(scholarshipName)) {
        scholarshipData.set(scholarshipName, { applications: 0, awarded: 0, totalFunding: 0 });
      }
      
      const data = scholarshipData.get(scholarshipName);
      data.applications++;
      
      if (app.status === 'awarded') {
        data.awarded++;
        data.totalFunding += app.awarded_amount || 0;
      }
    });

    const scholarshipImpact = Array.from(scholarshipData.entries()).map(([name, data]) => ({
      name,
      ...data,
      successRate: data.applications > 0 ? (data.awarded / data.applications) * 100 : 0
    }));

    // Calculate demographics
    const schools = new Map();
    const majors = new Map();
    const states = new Map();

    filteredApps.forEach(app => {
      // Schools
      if (app.school) {
        schools.set(app.school, (schools.get(app.school) || 0) + 1);
      }
      
      // Majors
      if (app.major) {
        majors.set(app.major, (majors.get(app.major) || 0) + 1);
      }
      
      // States
      if (app.state) {
        states.set(app.state, (states.get(app.state) || 0) + 1);
      }
    });

    const demographics = {
      schools: Array.from(schools.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10
      majors: Array.from(majors.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10
      states: Array.from(states.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    };

    // Event analytics
    let eventAnalytics = {
      totalEvents: 0,
      totalRegistrations: 0,
      averageAttendance: 0,
      capacityUtilization: 0,
      eventTrends: [] as { month: string; events: number; registrations: number }[]
    };

    if (events && events.length > 0) {
      const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0);
      const totalRegistrations = events.reduce((sum, event) => sum + (event.current_registrations || 0), 0);
      
      eventAnalytics = {
        totalEvents: events.length,
        totalRegistrations,
        averageAttendance: events.length > 0 ? totalRegistrations / events.length : 0,
        capacityUtilization: totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0,
        eventTrends: [] // TODO: Implement monthly event trends if needed
      };
    }

    const analyticsData: AnalyticsData = {
      overview: {
        totalApplications,
        totalAwarded,
        totalFunding,
        averageAward,
        successRate
      },
      applicationTrends,
      statusDistribution,
      scholarshipImpact,
      demographics,
      eventAnalytics
    };

    return { data: analyticsData, error: null };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get quick stats for dashboard cards
export async function getQuickStats(): Promise<{
  data: {
    applications: { total: number; change: number };
    funding: { total: number; change: number };
    events: { total: number; change: number };
    successRate: { rate: number; change: number };
  } | null;
  error: string | null;
}> {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get current and previous month data
    const { data: currentData } = await getAnalyticsData({
      start: currentMonth.toISOString(),
      end: nextMonth.toISOString()
    });

    const { data: previousData } = await getAnalyticsData({
      start: lastMonth.toISOString(),
      end: currentMonth.toISOString()
    });

    if (!currentData || !previousData) {
      return { data: null, error: 'Failed to fetch stats data' };
    }

    const stats = {
      applications: {
        total: currentData.overview.totalApplications,
        change: currentData.overview.totalApplications - previousData.overview.totalApplications
      },
      funding: {
        total: currentData.overview.totalFunding,
        change: currentData.overview.totalFunding - previousData.overview.totalFunding
      },
      events: {
        total: currentData.eventAnalytics.totalEvents,
        change: currentData.eventAnalytics.totalEvents - previousData.eventAnalytics.totalEvents
      },
      successRate: {
        rate: currentData.overview.successRate,
        change: currentData.overview.successRate - previousData.overview.successRate
      }
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}