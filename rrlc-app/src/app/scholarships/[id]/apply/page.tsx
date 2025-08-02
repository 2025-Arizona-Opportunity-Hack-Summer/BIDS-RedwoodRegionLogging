"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getScholarshipById } from "@/services/scholarships";
import { checkExistingApplication } from "@/services/applications";
import { Scholarship } from "@/types/database";
import { ApplicationForm } from "@/components/application/ApplicationForm";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated, isAuthReady } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const scholarshipId = params.id as string;
  const isEditMode = searchParams.get('mode') === 'edit';

  useEffect(() => {
    // Wait for auth to be ready and user to be available
    if (scholarshipId && !authLoading && isAuthReady() && isAuthenticated()) {
      fetchScholarshipAndCheckApplication();
    } else if (scholarshipId && !authLoading && !isAuthenticated()) {
      // User is not authenticated, redirect will be handled by ProtectedRoute
      setLoading(false);
    }
  }, [scholarshipId, user, authLoading, isAuthReady, isAuthenticated, isEditMode]);

  const fetchScholarshipAndCheckApplication = async () => {
    try {
      setLoading(true);
      
      // Fetch scholarship details
      const { data: scholarshipData, error: scholarshipError } = await getScholarshipById(scholarshipId);
      
      if (scholarshipError || !scholarshipData) {
        setError('Scholarship not found');
        return;
      }

      // Check if scholarship is active
      if (scholarshipData.status !== 'active') {
        setError('This scholarship is not currently accepting applications');
        return;
      }

      // Check deadline
      if (scholarshipData.deadline) {
        const deadline = new Date(scholarshipData.deadline);
        if (deadline < new Date()) {
          setError('The application deadline has passed');
          return;
        }
      }

      setScholarship(scholarshipData);

      // Check for existing application (only block if not in edit mode)
      if (user && user.email && !isEditMode) {
        const { data: existingApp, error: appError } = await checkExistingApplication(scholarshipId, user.email);
        if (existingApp) {
          setHasApplied(true);
        }
      }
    } catch (err) {
      console.error('Error loading scholarship:', err);
      setError('Failed to load scholarship details');
    } finally {
      setLoading(false);
    }
  };

  // Show loading only when actively fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-primary-dark">Loading scholarship details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-2 border-accent-dark p-8 text-center">
            <FiAlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-primary mb-4">
              Unable to Apply
            </h1>
            <p className="text-primary-dark mb-6">
              {error}
            </p>
            <Link href="/dashboard/scholarships">
              <Button className="bg-primary text-white hover:bg-primary-light">
                Browse Available Scholarships
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-2 border-accent-dark p-8 text-center">
            <FiAlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
            <h1 className="text-2xl font-bold text-primary mb-4">
              Already Applied
            </h1>
            <p className="text-primary-dark mb-6">
              You have already submitted an application for this scholarship.
            </p>
            <Link href="/dashboard/applications">
              <Button className="bg-primary text-white hover:bg-primary-light">
                View My Applications
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireApplicant={true}>
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Back Button */}
            <Link 
              href={`/scholarships/${scholarshipId}`}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>Back to Scholarship Details</span>
            </Link>

            {/* Application Form */}
            {scholarship ? (
              <ApplicationForm 
                scholarship={scholarship} 
                isEditMode={isEditMode}
                onSuccess={() => {
                  router.push('/dashboard/applications');
                }}
              />
            ) : (
              <Card className="bg-white border-2 border-accent-dark">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-primary-dark">Loading scholarship details...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}