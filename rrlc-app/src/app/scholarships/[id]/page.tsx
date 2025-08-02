"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiCalendar, 
  FiDollarSign, 
  FiFileText, 
  FiArrowLeft,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiUser
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Scholarship } from "@/types/database";

export default function PublicScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  const scholarshipId = params.id as string;

  useEffect(() => {
    if (scholarshipId) {
      fetchScholarship();
      if (user && isAuthenticated()) {
        checkExistingApplication();
      }
    }
  }, [scholarshipId, user]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .eq('status', 'active')
        .single();

      if (error) {
        setError(error.message);
        console.error('Error fetching scholarship:', error);
      } else {
        setScholarship(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load scholarship details');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    if (!user) return;

    try {
      setCheckingApplication(true);
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('scholarship_id', scholarshipId)
        .eq('applicant_id', user.id)
        .single();

      if (data) {
        setHasApplied(true);
      }
    } catch (err) {
      // No application found, which is fine
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    router.push(`/scholarships/${scholarshipId}/apply`);
  };

  const getDaysUntilDeadline = (deadline: string | null): { days: number | null; isExpired: boolean } => {
    if (!deadline) return { days: null, isExpired: false };
    const deadlineDate = new Date(deadline);
    const now = new Date();
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days: diffDays,
      isExpired: deadlineDate < now
    };
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Amount varies";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              Scholarship Not Found
            </h1>
            <p className="text-primary-dark mb-6">
              {error}
            </p>
            <Link href="/scholarships">
              <Button className="bg-primary text-white hover:bg-primary-light">
                Browse All Scholarships
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // If no scholarship data yet, show loading state within the layout
  if (!scholarship) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Back Button */}
            <Link 
              href="/scholarships"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>Back to Scholarships</span>
            </Link>

            {/* Loading Content */}
            <Card className="bg-white border-2 border-accent-dark">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary-dark">Loading scholarship details...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { days: daysLeft, isExpired } = getDaysUntilDeadline(scholarship.deadline);

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Back Button */}
          <Link 
            href="/scholarships"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Scholarships</span>
          </Link>

          {/* Main Content */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardContent className="p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-primary">
                    {scholarship.name}
                  </h1>
                  {daysLeft !== null && (
                    <div className={`px-4 py-2 rounded-full border font-medium ${
                      isExpired 
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : daysLeft <= 7 
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : 'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FiClock size={16} />
                        {isExpired ? 'Application Closed' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <FiDollarSign className="text-secondary" size={24} />
                    <div>
                      <div className="text-sm text-gray-600">Award Amount</div>
                      <div className="font-semibold text-primary">
                        {formatCurrency(scholarship.amount)}
                      </div>
                    </div>
                  </div>

                  {scholarship.deadline && (
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-secondary" size={24} />
                      <div>
                        <div className="text-sm text-gray-600">Deadline</div>
                        <div className="font-semibold text-primary">
                          {new Date(scholarship.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <FiFileText className="text-secondary" size={24} />
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-green-600">
                        {scholarship.status === 'active' ? 'Open for Applications' : scholarship.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-primary mb-4">About This Scholarship</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-primary-dark leading-relaxed">
                    {scholarship.description || "No description available for this scholarship."}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {scholarship.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-primary mb-4">Requirements</h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="prose prose-gray max-w-none">
                      <div className="text-primary-dark leading-relaxed">
                        {scholarship.requirements.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-2 last:mb-0 break-words">
                            {paragraph || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Prompt for Unauthenticated Users */}
              {!isAuthenticated() && !isExpired && (
                <div className="mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                      <FiUser className="text-blue-600" size={24} />
                      <div>
                        <h3 className="font-semibold text-blue-800">Ready to Apply?</h3>
                        <p className="text-blue-700">
                          Create an account or login to submit your application for this scholarship.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Status for Authenticated Users */}
              {isAuthenticated() && hasApplied && (
                <div className="mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                      <FiCheckCircle className="text-green-600" size={24} />
                      <div>
                        <h3 className="font-semibold text-green-800">Application Submitted</h3>
                        <p className="text-green-700">
                          You have already applied for this scholarship. Check your applications page for status updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated() && !isExpired && (
                  <>
                    <Button 
                      onClick={handleApply}
                      className="bg-primary text-white hover:bg-primary-light flex-1"
                    >
                      Login to Apply
                    </Button>
                    <Link href="/register" className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}

                {isAuthenticated() && !hasApplied && !isExpired && (
                  <Button 
                    onClick={handleApply}
                    disabled={checkingApplication}
                    className="bg-primary text-white hover:bg-primary-light flex-1"
                  >
                    {checkingApplication ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Checking...</span>
                      </div>
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                )}
                
                {isAuthenticated() && hasApplied && (
                  <Link href="/dashboard/applications" className="flex-1">
                    <Button 
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      View My Applications
                    </Button>
                  </Link>
                )}

                <Link href="/scholarships" className="flex-1">
                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Browse More Scholarships
                  </Button>
                </Link>
              </div>

              {isExpired && !hasApplied && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <FiAlertCircle className="text-red-600" size={24} />
                    <div>
                      <h3 className="font-semibold text-red-800">Application Period Closed</h3>
                      <p className="text-red-700">
                        The application deadline for this scholarship has passed. Check out other available opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}