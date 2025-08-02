"use client";

import { useState } from "react";
import { 
  FiDownload, 
  FiFileText, 
  FiUsers, 
  FiBook, 
  FiBarChart
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminContext } from "@/contexts/AdminContext";

interface ReportFilters {
  dateRange: 'last_month' | 'last_quarter' | 'last_year' | 'all_time';
  status: 'all' | 'submitted' | 'approved' | 'rejected' | 'awarded';
  scholarshipId: string;
}

function AdminReportsContent() {
  const { scholarships, applications, scholarshipsLoading, applicationsLoading } = useAdminContext();

  // Calculate summary statistics
  const stats = {
    totalApplications: applications.length,
    totalScholarships: scholarships.length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    awardedApplications: applications.filter(app => app.status === 'awarded').length,
    totalAwarded: applications
      .filter(app => app.awarded_amount)
      .reduce((sum, app) => sum + (app.awarded_amount || 0), 0),
    pendingApplications: applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length
  };

  const handleExportCSV = (type: 'applications' | 'scholarships' | 'summary') => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'applications':
        data = applications.map(app => ({
          'Application ID': app.id,
          'First Name': app.first_name,
          'Last Name': app.last_name,
          'Email': app.email,
          'Phone': app.phone,
          'School': app.school,
          'Major': app.major,
          'Graduation Year': app.graduation_year,
          'GPA': app.gpa,
          'Scholarship': app.scholarship.name,
          'Status': app.status,
          'Submission Date': app.submission_date ? new Date(app.submission_date).toLocaleDateString() : '',
          'Awarded Amount': app.awarded_amount ? `$${app.awarded_amount}` : '',
          'Awarded Date': app.awarded_date ? new Date(app.awarded_date).toLocaleDateString() : ''
        }));
        filename = 'scholarship_applications.csv';
        break;
        
      case 'scholarships':
        data = scholarships.map(scholarship => ({
          'Scholarship ID': scholarship.id,
          'Name': scholarship.name,
          'Description': scholarship.description,
          'Amount': scholarship.amount ? `$${scholarship.amount}` : 'Varies',
          'Deadline': scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline',
          'Status': scholarship.status,
          'Created': new Date(scholarship.created_at).toLocaleDateString(),
          'Applications Count': applications.filter(app => app.scholarship_id === scholarship.id).length
        }));
        filename = 'scholarships.csv';
        break;
        
      case 'summary':
        data = [{
          'Report Date': new Date().toLocaleDateString(),
          'Total Applications': stats.totalApplications,
          'Total Scholarships': stats.totalScholarships,
          'Approved Applications': stats.approvedApplications,
          'Awarded Applications': stats.awardedApplications,
          'Total Amount Awarded': `$${stats.totalAwarded.toLocaleString()}`,
          'Pending Applications': stats.pendingApplications
        }];
        filename = 'scholarship_summary.csv';
        break;
    }

    // Convert to CSV
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]?.toString() || '';
          // Escape quotes and wrap in quotes if contains comma
          return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (scholarshipsLoading || applicationsLoading) {
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
              <h1 className="text-4xl font-bold text-primary mb-2">
                Reports & Analytics
              </h1>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-3">
                  <FiFileText className="text-primary" size={24} />
                </div>
                <p className="text-sm text-primary-dark mb-2">Total Applications</p>
                <p className="text-3xl font-bold text-primary">{stats.totalApplications}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-3">
                  <FiBook className="text-primary" size={24} />
                </div>
                <p className="text-sm text-primary-dark mb-2">Active Scholarships</p>
                <p className="text-3xl font-bold text-primary">{stats.totalScholarships}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-3">
                  <FiUsers className="text-secondary" size={24} />
                </div>
                <p className="text-sm text-primary-dark mb-2">Awards Pending</p>
                <p className="text-3xl font-bold text-secondary">{stats.pendingApplications}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-accent-dark hover:border-primary-light transition-colors">
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-3">
                  <FiBarChart className="text-primary" size={24} />
                </div>
                <p className="text-sm text-primary-dark mb-2">Total Awarded</p>
                <p className="text-3xl font-bold text-primary">${stats.totalAwarded.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Export Actions */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary">
                Export Data
              </h2>
              <p className="text-primary-dark">
                Download comprehensive reports in CSV format
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <FiFileText className="mx-auto mb-3 text-primary" size={32} />
                  <h3 className="font-semibold text-primary mb-2">Applications Report</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete application data with applicant details and status
                  </p>
                  <Button 
                    onClick={() => handleExportCSV('applications')}
                    className="w-full bg-primary text-white hover:bg-primary-light"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Export Applications
                  </Button>
                </div>

                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <FiBook className="mx-auto mb-3 text-primary" size={32} />
                  <h3 className="font-semibold text-primary mb-2">Scholarships Report</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scholarship details with application counts and status
                  </p>
                  <Button 
                    onClick={() => handleExportCSV('scholarships')}
                    className="w-full bg-primary text-white hover:bg-primary-light"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Export Scholarships
                  </Button>
                </div>

                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <FiBarChart className="mx-auto mb-3 text-primary" size={32} />
                  <h3 className="font-semibold text-primary mb-2">Summary Report</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    High-level statistics and key performance metrics
                  </p>
                  <Button 
                    onClick={() => handleExportCSV('summary')}
                    className="w-full bg-primary text-white hover:bg-primary-light"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Export Summary
                  </Button>
                </div>
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
              <div className="space-y-4">
                {applications
                  .filter(app => app.submission_date)
                  .sort((a, b) => new Date(b.submission_date!).getTime() - new Date(a.submission_date!).getTime())
                  .slice(0, 5)
                  .map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <FiUsers className="text-white" size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-primary">
                            {app.first_name} {app.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Applied to {app.scholarship.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(app.submission_date!).toLocaleDateString()}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                {applications.filter(app => app.submission_date).length === 0 && (
                  <p className="text-gray-600 text-center py-8">
                    No recent applications to display.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminReportsContent />
    </ProtectedRoute>
  );
}