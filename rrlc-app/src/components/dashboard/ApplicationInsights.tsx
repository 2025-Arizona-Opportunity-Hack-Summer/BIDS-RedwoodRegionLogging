"use client";

import { useState, useEffect } from "react";
import { 
  FiTrendingUp, 
  FiTarget, 
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiStar
} from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  action?: {
    text: string;
    href: string;
  };
  priority: number;
}

export function ApplicationInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const generateInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's applications
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          status,
          awarded_amount,
          created_at,
          updated_at,
          scholarship:scholarships(amount, deadline)
        `)
        .eq('applicant_id', user.id);

      // Fetch available scholarships
      const { data: availableScholarships } = await supabase
        .from('scholarships')
        .select('id, amount, deadline')
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true });

      const insights: Insight[] = [];

      // Success insights
      const awardedApps = applications?.filter(app => app.status === 'awarded') || [];
      const totalAwarded = awardedApps.reduce((sum, app) => sum + (app.awarded_amount || 0), 0);

      if (awardedApps.length > 0) {
        insights.push({
          id: 'total-awards',
          type: 'success',
          title: 'Outstanding Achievement!',
          description: `You've won ${awardedApps.length} scholarship${awardedApps.length > 1 ? 's' : ''} totaling ${formatCurrency(totalAwarded)}`,
          priority: 1
        });
      }

      // Application performance insights
      const approvedApps = applications?.filter(app => app.status === 'approved' || app.status === 'awarded') || [];
      const totalApps = applications?.length || 0;
      
      if (totalApps >= 3) {
        const successRate = Math.round((approvedApps.length / totalApps) * 100);
        if (successRate >= 50) {
          insights.push({
            id: 'high-success-rate',
            type: 'success',
            title: 'Great Success Rate!',
            description: `${successRate}% of your applications are approved or awarded`,
            priority: 2
          });
        } else if (successRate < 25) {
          insights.push({
            id: 'improve-applications',
            type: 'tip',
            title: 'Opportunity for Improvement',
            description: 'Consider reviewing and strengthening your applications',
            action: {
              text: 'View Application Tips',
              href: '/resources/tips'
            },
            priority: 3
          });
        }
      }

      // Deadline warnings
      const urgentDeadlines = availableScholarships?.filter(scholarship => {
        const deadline = new Date(scholarship.deadline);
        const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 3 && daysUntilDeadline > 0;
      }) || [];

      if (urgentDeadlines.length > 0) {
        insights.push({
          id: 'urgent-deadlines',
          type: 'warning',
          title: 'Deadlines Approaching!',
          description: `${urgentDeadlines.length} scholarship${urgentDeadlines.length > 1 ? 's' : ''} closing in 3 days or less`,
          action: {
            text: 'View Scholarships',
            href: '/scholarships'
          },
          priority: 1
        });
      }

      // New opportunities
      const weeklyNewScholarships = availableScholarships?.filter(scholarship => {
        const deadlineDate = new Date(scholarship.deadline);
        const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        return deadlineDate > twoWeeksFromNow;
      }) || [];

      if (weeklyNewScholarships.length > 5) {
        insights.push({
          id: 'new-opportunities',
          type: 'info',
          title: 'New Opportunities Available',
          description: `${weeklyNewScholarships.length} new scholarships are accepting applications`,
          action: {
            text: 'Explore Opportunities',
            href: '/scholarships'
          },
          priority: 4
        });
      }

      // Activity insights
      const recentApps = applications?.filter(app => {
        const appDate = new Date(app.created_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return appDate >= thirtyDaysAgo;
      }) || [];

      if (totalApps > 0 && recentApps.length === 0) {
        insights.push({
          id: 'inactive-period',
          type: 'tip',
          title: 'Stay Active',
          description: "You haven't submitted any applications recently. Consistent applications increase your chances of success",
          action: {
            text: 'Browse Scholarships',
            href: '/scholarships'
          },
          priority: 3
        });
      }

      // First-time user tips
      if (totalApps === 0) {
        insights.push({
          id: 'getting-started',
          type: 'info',
          title: 'Welcome to Your Scholarship Journey!',
          description: 'Start by exploring available scholarships and submitting your first application',
          action: {
            text: 'Get Started',
            href: '/scholarships'
          },
          priority: 1
        });
      }

      // Sort insights by priority
      insights.sort((a, b) => a.priority - b.priority);

      setInsights(insights.slice(0, 4)); // Show top 4 insights
    } catch (err) {
      console.error('Error generating insights:', err);
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" size={20} />;
      case 'info':
        return <FiInfo className="text-blue-500" size={20} />;
      case 'tip':
        return <FiStar className="text-purple-500" size={20} />;
      default:
        return <FiInfo className="text-gray-500" size={20} />;
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'tip':
        return 'border-l-4 border-purple-500 bg-purple-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-2 border-accent-dark h-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-accent-dark h-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-6">Insights & Recommendations</h3>

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <FiTrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No insights available yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit applications to get personalized insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg ${getInsightStyle(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <a 
                        href={insight.action.href}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {insight.action.text} →
                      </a>
                    )}
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