"use client";

import { useState, useEffect } from "react";
import { 
  FiFileText, 
  FiCheck, 
  FiClock, 
  FiDollarSign,
  FiTrendingUp,
  FiAward
} from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface DashboardStatsData {
  totalApplications: number;
  approvedApplications: number;
  awardedApplications: number;
  totalAwardedAmount: number;
  pendingApplications: number;
  recentActivity: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, color, description, trend }: StatCardProps) {
  return (
    <Card className="bg-white border-2 border-accent-dark hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <p className="text-2xl font-bold text-primary">{value}</p>
              </div>
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <FiTrendingUp size={14} className={trend.isPositive ? "text-green-500" : "text-red-500"} />
                <span className={`text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {trend.isPositive ? "+" : ""}{trend.value}% this month
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData>({
    totalApplications: 0,
    approvedApplications: 0,
    awardedApplications: 0,
    totalAwardedAmount: 0,
    pendingApplications: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: applications, error } = await supabase
        .from('applications')
        .select('status, awarded_amount, created_at, updated_at')
        .eq('applicant_id', user.id);

      if (error) {
        console.error('Error fetching dashboard stats:', error);
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const totalApplications = applications?.length || 0;
      const approvedApplications = applications?.filter(app => app.status === 'approved' || app.status === 'awarded').length || 0;
      const awardedApplications = applications?.filter(app => app.status === 'awarded').length || 0;
      const totalAwardedAmount = applications?.reduce((sum, app) => sum + (app.awarded_amount || 0), 0) || 0;
      const pendingApplications = applications?.filter(app => app.status === 'submitted' || app.status === 'under_review').length || 0;
      
      // Recent activity in the last 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentActivity = applications?.filter(app => {
        const updatedDate = new Date(app.updated_at);
        return updatedDate >= thirtyDaysAgo;
      }).length || 0;

      setStats({
        totalApplications,
        approvedApplications,
        awardedApplications,
        totalAwardedAmount,
        pendingApplications,
        recentActivity
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Applications"
        value={stats.totalApplications}
        icon={FiFileText}
        color="bg-blue-500"
        description="All your submitted applications"
      />
      
      <StatCard
        title="Under Review"
        value={stats.pendingApplications}
        icon={FiClock}
        color="bg-yellow-500"
        description="Applications pending review"
      />
      
      <StatCard
        title="Approved"
        value={stats.approvedApplications}
        icon={FiCheck}
        color="bg-green-500"
        description="Approved applications"
      />
      
      <StatCard
        title="Scholarships Won"
        value={stats.awardedApplications}
        icon={FiAward}
        color="bg-purple-500"
        description="Awarded scholarships"
      />
      
      <StatCard
        title="Total Awards"
        value={formatCurrency(stats.totalAwardedAmount)}
        icon={FiDollarSign}
        color="bg-emerald-500"
        description="Total scholarship amount awarded"
      />
      
      <StatCard
        title="Recent Activity"
        value={stats.recentActivity}
        icon={FiTrendingUp}
        color="bg-indigo-500"
        description="Updates in the last 30 days"
      />
    </div>
  );
}