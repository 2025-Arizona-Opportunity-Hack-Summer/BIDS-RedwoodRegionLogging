"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminContext } from "@/contexts/AdminContext";

function AdminDashboardContent() {
  const { profile } = useAuth();
  const { scholarships, applications, scholarshipsLoading, applicationsLoading } = useAdminContext();

  // Calculate statistics
  const stats = {
    totalApplicationsThisMonth: applications.filter(app => {
      const appDate = new Date(app.created_at);
      const now = new Date();
      return appDate.getMonth() === now.getMonth() && 
             appDate.getFullYear() === now.getFullYear();
    }).length,
    activeScholarships: scholarships.filter(s => s.status === 'active').length,
    pendingApplications: applications.filter(app => 
      app.status === 'submitted' || app.status === 'under_review'
    ).length,
    totalAwarded: applications
      .filter(app => app.awarded_amount)
      .reduce((sum, app) => sum + (app.awarded_amount || 0), 0)
  };

  const isLoading = scholarshipsLoading || applicationsLoading;

  return (
    <div className="min-h-screen bg-accent p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Admin Dashboard
            </h1>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Total Applications</p>
                {isLoading ? (
                  <div className="h-9 bg-gray-300 rounded animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-bold text-primary">{stats.totalApplicationsThisMonth}</p>
                )}
                <p className="text-sm text-primary-dark">This month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Active Scholarships</p>
                {isLoading ? (
                  <div className="h-9 bg-gray-300 rounded animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-bold text-primary">{stats.activeScholarships}</p>
                )}
                <p className="text-sm text-primary-dark">Currently open</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Awards Pending</p>
                {isLoading ? (
                  <div className="h-9 bg-gray-300 rounded animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-bold text-secondary">{stats.pendingApplications}</p>
                )}
                <p className="text-sm text-primary-dark">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Total Awarded</p>
                {isLoading ? (
                  <div className="h-9 bg-gray-300 rounded animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-bold text-primary">${stats.totalAwarded.toLocaleString()}</p>
                )}
                <p className="text-sm text-primary-dark">This year</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">
                Quick Actions
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <Link href="/admin/scholarships">
                  <Button 
                    size="lg"
                    className="w-full bg-primary text-white hover:bg-primary-light"
                  >
                    Manage Scholarships
                  </Button>
                </Link>
                
                <Link href="/admin/applications">
                  <Button 
                    size="lg"
                    className="w-full bg-primary-dark text-white hover:bg-primary"
                  >
                    Review Applications
                  </Button>
                </Link>
                
                <Link href="/admin/users">
                  <Button 
                    size="lg"
                    className="w-full bg-secondary text-primary hover:bg-secondary-light"
                  >
                    User Management
                  </Button>
                </Link>
                
                <Link href="/admin/reports">
                  <Button 
                    size="lg"
                    className="w-full bg-accent-dark text-white hover:bg-primary-light"
                  >
                    Generate Reports
                  </Button>
                </Link>
                
                <Link href="/admin/analytics">
                  <Button 
                    size="lg"
                    className="w-full bg-secondary-dark text-white hover:bg-secondary-light"
                  >
                    Analytics Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-300 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {applications
                    .filter(app => app.submission_date || app.created_at)
                    .sort((a, b) => {
                      const dateA = new Date(a.submission_date || a.created_at).getTime();
                      const dateB = new Date(b.submission_date || b.created_at).getTime();
                      return dateB - dateA;
                    })
                    .slice(0, 5)
                    .map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${app.first_name} ${app.last_name}`}
                            src={app.profile?.avatar_url || undefined}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-primary">
                              {app.first_name} {app.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Applied to {app.scholarship?.name || 'Scholarship'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(app.submission_date || app.created_at).toLocaleDateString()}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            app.status === 'awarded' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  {applications.filter(app => app.submission_date || app.created_at).length === 0 && (
                    <p className="text-primary-dark text-center py-8">
                      No recent activity to display.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 