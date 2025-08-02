"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiSearch, 
  FiFileText, 
  FiUser,
  FiClock,
  FiTrendingUp,
  FiBookOpen,
  FiExternalLink
} from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  color: string;
  priority: number;
}

const defaultActions: QuickAction[] = [
  {
    id: 'browse-scholarships',
    title: 'Browse Scholarships',
    description: 'Discover new scholarship opportunities',
    icon: FiSearch,
    href: '/scholarships',
    color: 'bg-blue-500',
    priority: 1
  },
  {
    id: 'view-applications',
    title: 'My Applications',
    description: 'Track your application status',
    icon: FiFileText,
    href: '/dashboard/applications',
    color: 'bg-green-500',
    priority: 2
  },
  {
    id: 'update-profile',
    title: 'Update Profile',
    description: 'Keep your information current',
    icon: FiUser,
    href: '/dashboard/profile/edit',
    color: 'bg-purple-500',
    priority: 3
  }
];

export function QuickActions() {
  const { user } = useAuth();
  const [actions, setActions] = useState<QuickAction[]>(defaultActions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPersonalizedActions();
    }
  }, [user]);

  const fetchPersonalizedActions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's application data to personalize actions
      const { data: applications } = await supabase
        .from('applications')
        .select('status, created_at, updated_at')
        .eq('applicant_id', user.id);

      // Fetch available scholarships to check for new opportunities
      const { data: scholarships } = await supabase
        .from('scholarships')
        .select('id, deadline')
        .gte('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(5);

      let personalizedActions = [...defaultActions];

      // If user has no applications, prioritize browsing scholarships
      if (!applications || applications.length === 0) {
        personalizedActions = personalizedActions.map(action => 
          action.id === 'browse-scholarships' 
            ? { ...action, title: 'Start Your Journey', description: 'Apply for your first scholarship', priority: 0 }
            : action
        );
      }

      // If user has pending applications, show tracking action
      const pendingApps = applications?.filter(app => 
        app.status === 'submitted' || app.status === 'under_review'
      ).length || 0;

      if (pendingApps > 0) {
        personalizedActions = personalizedActions.map(action => 
          action.id === 'view-applications' 
            ? { ...action, description: `${pendingApps} application${pendingApps > 1 ? 's' : ''} pending review` }
            : action
        );
      }

      // Add deadline reminder if there are scholarships closing soon
      const urgentScholarships = scholarships?.filter(scholarship => {
        const deadline = new Date(scholarship.deadline);
        const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
      }) || [];

      if (urgentScholarships.length > 0) {
        personalizedActions.push({
          id: 'urgent-deadlines',
          title: 'Urgent Deadlines',
          description: `${urgentScholarships.length} scholarship${urgentScholarships.length > 1 ? 's' : ''} closing soon`,
          icon: FiClock,
          href: '/scholarships',
          color: 'bg-red-500',
          priority: 0
        });
      }

      // Sort by priority
      personalizedActions.sort((a, b) => a.priority - b.priority);

      setActions(personalizedActions);
    } catch (err) {
      console.error('Error fetching personalized actions:', err);
      setActions(defaultActions);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.id} href={action.href}>
            <Card className="bg-white border-2 border-accent-dark hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${action.color}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center text-sm text-blue-600">
                      <span>Take action</span>
                      <FiExternalLink size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}