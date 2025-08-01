"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function HomePageContent() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Welcome, {profile?.full_name || "Student"}!
            </h1>
            <p className="text-lg text-primary-dark">
              Your scholarship application dashboard
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-accent-dark rounded-lg p-6">
              <h2 className="text-xl font-semibold text-primary mb-3">
                Browse Scholarships
              </h2>
              <p className="text-primary-dark mb-4">
                Discover available scholarship opportunities
              </p>
              <Link href="/scholarships">
                <Button className="bg-primary text-white hover:bg-primary-light">
                  View Scholarships
                </Button>
              </Link>
            </div>
            
            <div className="bg-white border-2 border-accent-dark rounded-lg p-6">
              <h2 className="text-xl font-semibold text-primary mb-3">
                My Applications
              </h2>
              <p className="text-primary-dark mb-4">
                Track your scholarship applications
              </p>
              <Button className="bg-secondary text-primary hover:bg-secondary-light">
                View Applications
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  );
}