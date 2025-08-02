"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function DashboardPageContent() {

  return (
    <div className="min-h-screen bg-accent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">
              Your scholarship application dashboard
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-accent-dark rounded-lg p-5">
              <h2 className="text-xl font-semibold text-primary mb-2">
                Browse Scholarships
              </h2>
              <p className="text-primary-dark mb-3">
                Discover available scholarship opportunities
              </p>
              <Link href="/scholarships">
                <Button className="bg-primary text-white hover:bg-primary-light">
                  View Scholarships
                </Button>
              </Link>
            </div>
            
            <div className="bg-white border-2 border-accent-dark rounded-lg p-5">
              <h2 className="text-xl font-semibold text-primary mb-2">
                My Applications
              </h2>
              <p className="text-primary-dark mb-3">
                Track your scholarship applications
              </p>
              <Link href="/dashboard/applications">
                <Button className="bg-secondary text-primary hover:bg-secondary-light">
                  View Applications
                </Button>
              </Link>
            </div>
          </div>
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