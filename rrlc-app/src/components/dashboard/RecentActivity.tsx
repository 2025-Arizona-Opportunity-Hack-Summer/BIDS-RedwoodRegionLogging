"use client";

import { useState, useEffect } from "react";
import { 
  FiClock, 
  FiCheck, 
  FiX, 
  FiDollarSign,
  FiFileText,
  FiEye
} from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Activity {
  id: string;
  type: 'status_change' | 'application_submitted' | 'award_received';
  title: string;
  description: string;
  timestamp: string;
  scholarshipName: string;
  scholarshipId: string;
  status?: string;
  awardAmount?: number;
  user?: {
    full_name: string | null;
    preferred_name: string | null;
    avatar_url: string | null;
  };
}

export function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          awarded_amount,
          created_at,
          updated_at,
          submission_date,
          scholarship:scholarships(id, name),
          applicant:profiles!applicant_id(full_name, preferred_name, avatar_url)
        `)
        .eq('applicant_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return;
      }

      // Convert applications to activity feed
      const activityFeed: Activity[] = [];

      applications?.forEach((app: any) => {
        // Add submission activity
        if (app.submission_date) {
          activityFeed.push({
            id: `${app.id}-submitted`,
            type: 'application_submitted',
            title: 'Application Submitted',
            description: `You submitted your application for ${app.scholarship?.name || 'Scholarship'}`,
            timestamp: app.submission_date,
            scholarshipName: app.scholarship?.name || 'Scholarship',
            scholarshipId: app.scholarship?.id || '',
            status: app.status,
            user: app.applicant
          });
        }

        // Add award activity
        if (app.status === 'awarded' && app.awarded_amount) {
          activityFeed.push({
            id: `${app.id}-awarded`,
            type: 'award_received',
            title: 'Scholarship Awarded! 🎉',
            description: `Congratulations! You've been awarded ${formatCurrency(app.awarded_amount)} for ${app.scholarship?.name || 'Scholarship'}`,
            timestamp: app.updated_at,
            scholarshipName: app.scholarship?.name || 'Scholarship',
            scholarshipId: app.scholarship?.id || '',
            status: app.status,
            awardAmount: app.awarded_amount,
            user: app.applicant
          });
        }

        // Add status change activity for other statuses
        if (app.status !== 'draft' && app.status !== 'submitted' && app.status !== 'awarded') {
          const statusTexts = {
            under_review: 'Your application is now under review',
            approved: 'Your application has been approved!',
            rejected: 'Your application was not selected this time'
          };

          if (statusTexts[app.status as keyof typeof statusTexts]) {
            activityFeed.push({
              id: `${app.id}-${app.status}`,
              type: 'status_change',
              title: `Application ${app.status.replace('_', ' ')}`,
              description: `${statusTexts[app.status as keyof typeof statusTexts]} for ${app.scholarship?.name || 'Scholarship'}`,
              timestamp: app.updated_at,
              scholarshipName: app.scholarship?.name || 'Scholarship',
              scholarshipId: app.scholarship?.id || '',
              status: app.status,
              user: app.applicant
            });
          }
        }
      });

      // Sort by timestamp and take recent items
      const sortedActivities = activityFeed
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setActivities(sortedActivities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'application_submitted':
        return <FiFileText className="text-blue-500" size={20} />;
      case 'award_received':
        return <FiDollarSign className="text-purple-500" size={20} />;
      case 'status_change':
        if (activity.status === 'approved') return <FiCheck className="text-green-500" size={20} />;
        if (activity.status === 'rejected') return <FiX className="text-red-500" size={20} />;
        return <FiClock className="text-yellow-500" size={20} />;
      default:
        return <FiFileText className="text-gray-500" size={20} />;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Card className="bg-white border-2 border-accent-dark h-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-accent-dark h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary">Recent Activity</h3>
          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm">
              <FiEye size={16} className="mr-2" />
              View All
            </Button>
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FiFileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit some scholarship applications to see your activity here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <Avatar
                    name={activity.user?.preferred_name || activity.user?.full_name || 'User'}
                    src={activity.user?.avatar_url || undefined}
                    size="sm"
                  />
                </div>
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-primary text-sm">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}