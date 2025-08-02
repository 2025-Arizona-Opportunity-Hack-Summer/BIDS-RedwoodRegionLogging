"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiFileText, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiDollarSign,
  FiCalendar,
  FiEye,
  FiAlertCircle
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { ApplicationWithDetails } from "@/types/database";

function MyApplicationsContent() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchMyApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          scholarship:scholarships (
            id,
            name,
            description,
            amount,
            deadline
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        console.error('Error fetching applications:', fetchError);
      } else {
        setApplications(data || []);
        setError(null);
      }
    } catch (err) {
      const errorMessage = 'Failed to load applications';
      setError(errorMessage);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <FiClock className="text-blue-500" size={20} />;
      case 'under_review':
        return <FiFileText className="text-yellow-500" size={20} />;
      case 'approved':
        return <FiCheck className="text-green-500" size={20} />;
      case 'rejected':
        return <FiX className="text-red-500" size={20} />;
      case 'awarded':
        return <FiDollarSign className="text-purple-500" size={20} />;
      case 'draft':
        return <FiAlertCircle className="text-gray-500" size={20} />;
      default:
        return <FiFileText className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'awarded': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Not Selected';
      case 'awarded': return 'Awarded';
      case 'draft': return 'Draft';
      default: return status.replace('_', ' ');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-primary-dark">Loading your applications...</p>
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
          <div className="bg-white border-2 border-accent-dark rounded-lg p-8 text-center">
            <FiAlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-red-600 mb-4">Error loading applications: {error}</p>
            <Button 
              onClick={fetchMyApplications}
              className="bg-primary text-white hover:bg-primary-light"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                My Applications
              </h1>
            </div>
            
            <Link href="/scholarships">
              <Button className="bg-primary text-white hover:bg-primary-light">
                Browse More Scholarships
              </Button>
            </Link>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <Card className="bg-white border-2 border-accent-dark p-8 text-center">
              <FiFileText className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-semibold text-primary mb-2">
                No Applications Yet
              </h3>
              <p className="text-primary-dark mb-6">
                You haven&apos;t submitted any scholarship applications yet. 
                Browse available scholarships to get started!
              </p>
              <Link href="/scholarships">
                <Button className="bg-primary text-white hover:bg-primary-light">
                  Browse Scholarships
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card 
                  key={application.id} 
                  className="bg-white border-2 border-accent-dark hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(application.status)}
                          <h3 className="text-xl font-semibold text-primary">
                            {application.scholarship.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </span>
                          {application.awarded_amount && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                              {formatCurrency(application.awarded_amount)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-primary-dark mb-4 line-clamp-2">
                          {application.scholarship.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            <span>
                              Applied: {application.submission_date 
                                ? new Date(application.submission_date).toLocaleDateString()
                                : 'Draft'}
                            </span>
                          </div>
                          
                          {application.scholarship.amount && (
                            <div className="flex items-center gap-1">
                              <FiDollarSign size={14} />
                              <span>{formatCurrency(application.scholarship.amount)}</span>
                            </div>
                          )}
                          
                          {application.scholarship.deadline && (
                            <div className="flex items-center gap-1">
                              <FiClock size={14} />
                              <span>
                                Deadline: {new Date(application.scholarship.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status-specific messages */}
                        {application.status === 'approved' && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm">
                              🎉 Congratulations! Your application has been approved. You should receive further instructions soon.
                            </p>
                          </div>
                        )}
                        
                        {application.status === 'awarded' && (
                          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-purple-800 text-sm">
                              🏆 Amazing! You&apos;ve been awarded this scholarship. 
                            </p>
                          </div>
                        )}
                        
                        {application.status === 'rejected' && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">
                              We appreciate your application. While you weren&apos;t selected this time, keep applying to other opportunities!
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Link href={`/scholarships/${application.scholarship.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            <FiEye size={16} className="mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {applications.length > 0 && (
            <Card className="bg-white border-2 border-accent-dark">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Application Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {applications.filter(app => app.status === 'submitted').length}
                    </div>
                    <div className="text-sm text-gray-600">Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'under_review').length}
                    </div>
                    <div className="text-sm text-gray-600">Under Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {applications.filter(app => app.status === 'approved').length}
                    </div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {applications.filter(app => app.status === 'awarded').length}
                    </div>
                    <div className="text-sm text-gray-600">Awarded</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyApplicationsPage() {
  return (
    <ProtectedRoute requireApplicant={true}>
      <MyApplicationsContent />
    </ProtectedRoute>
  );
}