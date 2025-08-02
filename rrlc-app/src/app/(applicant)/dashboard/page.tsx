"use client";

import Link from "next/link";
import { 
  FiTarget, 
  FiClock,
  FiUsers,
  FiBookOpen
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ApplicationInsights } from "@/components/dashboard/ApplicationInsights";

function DashboardPageContent() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                Welcome back!
              </h1>
              <p className="text-lg text-primary-dark">
                Track your scholarship journey and discover new opportunities
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link href="/dashboard/scholarships">
                <Button className="bg-primary text-white hover:bg-primary-light">
                  <FiTarget className="mr-2" />
                  Browse Scholarships
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-4">Your Progress</h2>
            <DashboardStats />
          </div>


          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="h-full">
              <RecentActivity />
            </div>

            {/* Insights & Tips */}
            <div className="h-full">
              <ApplicationInsights />
            </div>
          </div>

          {/* Helpful Resources */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Scholarship Success Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiBookOpen className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">Research Thoroughly</h4>
                    <p className="text-sm text-gray-600">
                      Read scholarship requirements carefully and tailor your applications accordingly
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiClock className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">Apply Early</h4>
                    <p className="text-sm text-gray-600">
                      Submit applications well before deadlines to avoid last-minute issues
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">Get Feedback</h4>
                    <p className="text-sm text-gray-600">
                      Have mentors or teachers review your essays before submitting
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireApplicant={true}>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}