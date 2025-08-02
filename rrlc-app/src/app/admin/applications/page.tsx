"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiEye, 
  FiMail, 
  FiCheck, 
  FiX, 
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiFileText,
  FiMoreVertical
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { updateApplicationStatus } from "@/services/adminApplications";
import { ApplicationWithDetails } from "@/types/database";
import { useAdminApplicationContext } from "@/contexts/AdminContext";

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'awarded';

interface ApplicationActionsProps {
  application: ApplicationWithDetails;
  onView: () => void;
  onUpdateStatus: (status: ApplicationStatus) => void;
  onSendEmail: () => void;
}

function ApplicationActions({ application, onView, onUpdateStatus, onSendEmail }: ApplicationActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusActions = [
    { status: 'under_review' as ApplicationStatus, label: 'Under Review', color: 'text-blue-600' },
    { status: 'approved' as ApplicationStatus, label: 'Approve', color: 'text-green-600' },
    { status: 'rejected' as ApplicationStatus, label: 'Reject', color: 'text-red-600' },
    { status: 'awarded' as ApplicationStatus, label: 'Award', color: 'text-purple-600' }
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="p-2"
      >
        <FiMoreVertical size={16} />
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 py-2 min-w-[160px]">
          <button
            onClick={() => {
              onView();
              setShowMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
          >
            <FiEye size={14} />
            View Details
          </button>
          
          <button
            onClick={() => {
              onSendEmail();
              setShowMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
          >
            <FiMail size={14} />
            Send Email
          </button>
          
          <div className="border-t my-2" />
          
          {statusActions.map(({ status, label, color }) => (
            <button
              key={status}
              onClick={() => {
                onUpdateStatus(status);
                setShowMenu(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm ${color}`}
            >
              {status === 'approved' && <FiCheck size={14} />}
              {status === 'rejected' && <FiX size={14} />}
              {status === 'awarded' && <FiDollarSign size={14} />}
              Mark as {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminApplicationsContent() {
  const router = useRouter();
  const { applications, loading, isRefreshing, refreshApplications, updateApplicationInCache } = useAdminApplicationContext();
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [scholarshipFilter, setScholarshipFilter] = useState<string>("all");

  const [scholarships, setScholarships] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    // Extract unique scholarships for filter whenever applications change
    if (applications.length > 0) {
      const uniqueScholarships = Array.from(
        new Map(applications.map(app => [app.scholarship.id, app.scholarship])).values()
      );
      setScholarships(uniqueScholarships.map(s => ({ id: s.id, name: s.name })));
    }
  }, [applications]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter, scholarshipFilter]);

  // Trigger a background refresh when component mounts (for navigation from other pages)
  useEffect(() => {
    if (applications.length > 0) {
      // If we already have data, do a background refresh
      refreshApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterApplications = () => {
    let filtered = applications;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(app => 
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.scholarship.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply scholarship filter
    if (scholarshipFilter !== "all") {
      filtered = filtered.filter(app => app.scholarship_id === scholarshipFilter);
    }
    
    setFilteredApplications(filtered);
  };

  const handleUpdateStatus = async (applicationId: string, status: ApplicationStatus) => {
    const { data, error } = await updateApplicationStatus(applicationId, status);
    if (!error && data) {
      updateApplicationInCache(data);
    } else {
      alert('Failed to update application status');
    }
  };

  const handleViewApplication = (application: ApplicationWithDetails) => {
    router.push(`/admin/applications/${application.id}`);
  };

  const handleSendEmail = (application: ApplicationWithDetails) => {
    // This would open email composer
    alert(`Send email to ${application.email} - Feature coming soon!`);
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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Only show loading skeleton if we're loading and have no application data yet
  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="h-20 bg-gray-300 rounded animate-pulse" />
            <div className="h-96 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-primary mb-2">
                  Application Management
                </h1>
                {isRefreshing && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
                )}
              </div>
            </div>
            
            <Button className="bg-primary text-white hover:bg-primary-light">
              <FiDownload className="mr-2" />
              Export CSV
            </Button>
          </div>
          
          {/* Filters */}
          <Card className="bg-white border-2 border-accent-dark p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or scholarship..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="awarded">Awarded</option>
                <option value="draft">Draft</option>
              </select>
              
              <select
                value={scholarshipFilter}
                onChange={(e) => setScholarshipFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="all">All Scholarships</option>
                {scholarships.map(scholarship => (
                  <option key={scholarship.id} value={scholarship.id}>
                    {scholarship.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
          
          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <Card className="bg-white border-2 border-accent-dark p-8 text-center">
              <p className="text-primary-dark">
                {applications.length === 0 
                  ? "No applications received yet."
                  : "No applications found matching your filters."}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((application) => (
                <Card 
                  key={application.id} 
                  className="bg-white border-2 border-accent-dark p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-primary" size={18} />
                          <h3 className="text-xl font-semibold text-primary">
                            {application.first_name} {application.last_name}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                        {application.awarded_amount && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {formatCurrency(application.awarded_amount)}
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-primary-dark font-medium">
                          {application.scholarship.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.email} • {application.school}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          <span>
                            Applied: {application.submission_date 
                              ? new Date(application.submission_date).toLocaleDateString()
                              : 'Draft'}
                          </span>
                        </div>
                        
                        {application.major && (
                          <div className="flex items-center gap-1">
                            <FiFileText size={14} />
                            <span>{application.major}</span>
                          </div>
                        )}
                        
                        {application.graduation_year && (
                          <span>Class of {application.graduation_year}</span>
                        )}
                      </div>
                    </div>
                    
                    <ApplicationActions
                      application={application}
                      onView={() => handleViewApplication(application)}
                      onUpdateStatus={(status) => handleUpdateStatus(application.id, status)}
                      onSendEmail={() => handleSendEmail(application)}
                    />
                  </div>
                  
                  {/* Quick preview of responses */}
                  {application.career_goals && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">Career Goals:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {application.career_goals}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminApplicationsContent />
    </ProtectedRoute>
  );
}