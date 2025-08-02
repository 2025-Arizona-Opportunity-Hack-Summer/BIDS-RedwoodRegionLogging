"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  FiArrowLeft, 
  FiMail, 
  FiDownload, 
  FiPrinter,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiPhone,
  FiFileText,
  FiBookOpen,
  FiEdit3,
  FiCheck,
  FiX,
  FiClock,
  FiAward
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ApplicationWithDetails } from "@/types/database";
import { getApplicationByIdForAdmin, updateApplicationStatus } from "@/services/adminApplications";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awarded';

function ApplicationDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [awardAmount, setAwardAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await getApplicationByIdForAdmin(applicationId);
      
      if (error) {
        setError(error);
        return;
      }

      if (!data) {
        setError("Application not found");
        return;
      }

      setApplication(data);
      setAdminNotes(data.admin_notes || "");
    } catch (err) {
      setError("Failed to load application details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (!application) return;

    setUpdating(true);
    try {
      const updates: any = {};
      
      if (newStatus === 'awarded' && awardAmount) {
        updates.awardedAmount = parseFloat(awardAmount);
        updates.awardedDate = new Date().toISOString();
      }

      if (adminNotes !== application.admin_notes) {
        updates.notes = adminNotes;
      }

      const { data, error } = await updateApplicationStatus(
        application.id,
        newStatus,
        updates.awardedAmount,
        updates.awardedDate,
        updates.notes
      );

      if (error) {
        alert(`Failed to update application status: ${error}`);
        return;
      }

      if (data) {
        // Update the local state with the new data
        setApplication(data);
        setAdminNotes(data.admin_notes || "");
        setShowAwardForm(false);
        setAwardAmount("");
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!application || adminNotes === application.admin_notes) return;

    setUpdating(true);
    try {
      const { data, error } = await updateApplicationStatus(
        application.id,
        application.status,
        undefined,
        undefined,
        adminNotes
      );

      if (error) {
        alert(`Failed to save notes: ${error}`);
        return;
      }

      if (data) {
        setApplication(data);
        alert('Notes saved successfully');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'awarded': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement PDF export
    alert('Export feature coming soon!');
  };

  const handleRemoveAward = () => {
    if (!application?.awarded_amount) return;
    setShowRemoveModal(true);
  };

  const confirmRemoveAward = async () => {
    if (!application?.awarded_amount) return;

    setUpdating(true);
    try {
      const { data, error } = await updateApplicationStatus(
        application.id,
        'approved',
        undefined, // Remove awarded amount
        undefined, // Remove awarded date
        application.admin_notes || undefined
      );

      if (error) {
        alert(`Failed to remove award: ${error}`);
        return;
      }

      if (data) {
        setApplication(data);
        setShowRemoveModal(false);
        alert('Award removed successfully');
      }
    } catch (err) {
      console.error('Error removing award:', err);
      alert('Failed to remove award');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="h-10 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="flex items-center gap-4 mb-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information skeleton */}
              <Card className="bg-white border-2 border-accent-dark p-6">
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Academic Information skeleton */}
              <Card className="bg-white border-2 border-accent-dark p-6">
                <div className="h-6 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Essay Responses skeleton */}
              <Card className="bg-white border-2 border-accent-dark p-6">
                <div className="h-6 w-36 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <Card className="bg-white border-2 border-accent-dark p-6">
                <div className="h-6 w-36 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white border-2 border-accent-dark p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white border-2 border-accent-dark p-8 text-center">
            <p className="text-red-600 mb-4">{error || "Application not found"}</p>
            <Button onClick={() => router.push('/admin/applications')}>
              <FiArrowLeft className="mr-2" />
              Back to Applications
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/applications')}
              className="mb-4"
            >
              <FiArrowLeft className="mr-2" />
              Back to Applications
            </Button>
            
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-primary mb-2">
                {application.first_name} {application.last_name}
              </h1>
              <Badge className={`${getStatusColor(application.status)} px-3 py-1`}>
                {application.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-gray-600 mt-2">
              Application for {application.scholarship.name}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <FiPrinter className="mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FiDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <FiUser className="mr-2" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{application.first_name} {application.last_name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{application.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{application.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {application.address && (
                      <>
                        {application.address}<br />
                        {application.city}, {application.state} {application.zip}
                      </>
                    ) || 'Not provided'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Academic Information */}
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <FiBookOpen className="mr-2" />
                Academic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">School</p>
                  <p className="font-medium">{application.school || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Major</p>
                  <p className="font-medium">{application.major || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Graduation Year</p>
                  <p className="font-medium">{application.graduation_year || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">GPA</p>
                  <p className="font-medium">{application.gpa || 'Not provided'}</p>
                </div>
              </div>
            </Card>

            {/* Essay Responses */}
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <FiEdit3 className="mr-2" />
                Essay Responses
              </h2>
              
              <div className="space-y-4">
                {application.career_goals && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Career Goals</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{application.career_goals}</p>
                  </div>
                )}
                
                {application.financial_need && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Financial Need</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{application.financial_need}</p>
                  </div>
                )}
                
                {application.community_involvement && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Community Involvement</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{application.community_involvement}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Custom Field Responses */}
            {application.custom_responses && Object.keys(application.custom_responses).length > 0 && (
              <Card className="bg-white border-2 border-accent-dark p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">
                  Additional Information
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(application.custom_responses).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Documents */}
            {application.documents && application.documents.length > 0 && (
              <Card className="bg-white border-2 border-accent-dark p-6">
                <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <FiFileText className="mr-2" />
                  Documents
                </h2>
                
                <div className="space-y-2">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-gray-600">
                          Document • Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Details */}
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Application Details</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Application ID</p>
                  <p className="font-mono text-sm">{application.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Submitted Date</p>
                  <p className="font-medium">
                    {application.submission_date 
                      ? formatDate(application.submission_date)
                      : 'Not submitted'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{formatDate(application.updated_at)}</p>
                </div>
                
                {application.awarded_amount && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Awarded Amount</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(application.awarded_amount)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Award Date</p>
                      <p className="font-medium">
                        {application.awarded_date ? formatDate(application.awarded_date) : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Status Actions */}
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Update Status</h3>
              
              <div className="space-y-2">
                {application.status !== 'under_review' && (
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                    onClick={() => handleStatusUpdate('under_review')}
                    disabled={updating}
                  >
                    <FiClock className="mr-2" />
                    Mark as Under Review
                  </Button>
                )}
                
                {application.status !== 'approved' && (
                  <Button
                    variant="outline"
                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={updating}
                  >
                    <FiCheck className="mr-2" />
                    Approve Application
                  </Button>
                )}
                
                {application.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updating}
                  >
                    <FiX className="mr-2" />
                    Reject Application
                  </Button>
                )}
                
                {application.status !== 'awarded' && (
                  <Button
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => setShowAwardForm(!showAwardForm)}
                    disabled={updating}
                  >
                    <FiAward className="mr-2" />
                    Award Scholarship
                  </Button>
                )}
                
                {application.status === 'awarded' && application.awarded_amount && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    onClick={handleRemoveAward}
                    disabled={updating}
                  >
                    <FiX className="mr-2" />
                    Remove Award
                  </Button>
                )}
              </div>
              
              {showAwardForm && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Award Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('awarded')}
                    disabled={!awardAmount || updating}
                  >
                    Confirm Award
                  </Button>
                </div>
              )}
            </Card>

            {/* Admin Notes */}
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Admin Notes</h3>
              
              <Textarea
                placeholder="Add internal notes about this application..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="mb-3"
              />
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveNotes}
                disabled={adminNotes === application.admin_notes || updating}
              >
                Save Notes
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Remove Award Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={confirmRemoveAward}
        title="Remove Award"
        message={`Are you sure you want to remove the award of ${application?.awarded_amount ? formatCurrency(application.awarded_amount) : ''} from ${application ? `${application.first_name} ${application.last_name}` : ''}? This action will change their status back to "Approved".`}
        confirmText="Remove Award"
        cancelText="Cancel"
        variant="warning"
        isLoading={updating}
      />
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <ApplicationDetailsContent />
    </ProtectedRoute>
  );
}