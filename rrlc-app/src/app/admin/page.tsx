"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function AdminDashboardContent() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Home
            </h1>
            <p className="text-lg text-primary-dark">
              Welcome back, {profile?.full_name || "Administrator"}!
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Total Applications</p>
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-primary-dark">This month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Active Scholarships</p>
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-primary-dark">Currently open</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Awards Pending</p>
                <p className="text-3xl font-bold text-secondary">0</p>
                <p className="text-sm text-primary-dark">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <p className="text-sm text-primary-dark mb-2">Total Awarded</p>
                <p className="text-3xl font-bold text-primary">$0</p>
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
              <p className="text-primary-dark text-center py-8">
                No recent activity to display.
              </p>
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