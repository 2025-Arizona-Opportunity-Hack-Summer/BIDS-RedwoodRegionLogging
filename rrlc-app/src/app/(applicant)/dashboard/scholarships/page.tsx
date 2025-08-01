"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiClock, FiDollarSign, FiFileText, FiArrowRight, FiInfo, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useActiveScholarships } from "@/hooks/useScholarships";
import { Scholarship } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ScholarshipFilters {
  search: string;
  minAmount?: number;
  maxAmount?: number;
  deadline: 'week' | 'month' | 'quarter' | 'all';
  status?: 'all' | 'applied' | 'not_applied';
}

function ScholarshipCardSkeleton() {
  return (
    <div className="bg-white border-2 h-88 rounded-md p-6" style={{ borderColor: 'rgb(146,169,129)' }}>
      <div className="flex flex-col space-y-4">
        <div className="h-6 w-4/5 bg-gray-300 rounded animate-pulse" />
        <div className="h-15 w-full bg-gray-300 rounded animate-pulse" />
        <div className="flex space-x-4">
          <div className="h-5 w-25 bg-gray-300 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="h-10 w-30 bg-gray-300 rounded animate-pulse" />
      </div>
    </div>
  );
}

function CountdownBadge({ deadline }: { deadline: string | null }) {
  const getDaysUntilDeadline = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const days = getDaysUntilDeadline(deadline);
  
  if (days === null) {
    return (
      <span className="badge bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
        <div className="flex items-center space-x-1">
          <FiClock size={12} />
          <span className="text-xs">No deadline</span>
        </div>
      </span>
    );
  }

  if (days === 0) {
    return (
      <span className="badge bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">
        <div className="flex items-center space-x-1">
          <FiClock size={12} />
          <span className="text-xs font-medium">Due today</span>
        </div>
      </span>
    );
  }

  const bgColor = days <= 7 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200';
  
  return (
    <span className={`badge ${bgColor} px-3 py-1 rounded-full border`}>
      <div className="flex items-center space-x-1">
        <FiClock size={12} />
        <span className="text-xs font-medium">{days} day{days !== 1 ? 's' : ''} left</span>
      </div>
    </span>
  );
}

function ApplicationStatusBadge({ hasApplied }: { hasApplied: boolean }) {
  if (hasApplied) {
    return (
      <span className="badge bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
        <div className="flex items-center space-x-1">
          <FiCheckCircle size={12} />
          <span className="text-xs font-medium">Applied</span>
        </div>
      </span>
    );
  }
  
  return (
    <span className="badge bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
      <div className="flex items-center space-x-1">
        <FiXCircle size={12} />
        <span className="text-xs font-medium">Not Applied</span>
      </div>
    </span>
  );
}

function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const router = useRouter();
  // TODO: Replace with actual application status check
  const hasApplied = false; // This would come from checking user's applications

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/scholarships/${scholarship.id}/apply`);
  };

  const handleViewApplicationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/dashboard/applications'); // Navigate to applications page filtered for this scholarship
  };

  return (
    <div 
      className="bg-white border-2 hover:border-primary hover:shadow-lg transition-all duration-200 rounded-md p-6 flex flex-col justify-between h-full"
      style={{ borderColor: 'rgb(146,169,129)' }}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xl font-semibold text-primary line-clamp-2 flex-1">
            {scholarship.name}
          </h3>
          <div className="flex flex-col gap-1 items-end">
            <CountdownBadge deadline={scholarship.deadline} />
            <ApplicationStatusBadge hasApplied={hasApplied} />
          </div>
        </div>
        
        <p className="text-primary-dark text-sm line-clamp-3 leading-relaxed">
          {scholarship.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-primary-dark">
          <div className="flex items-center space-x-1">
            <FiDollarSign size={16} className="text-secondary" />
            <span className="font-medium">
              {scholarship.amount ? `$${scholarship.amount.toLocaleString()}` : 'Amount varies'}
            </span>
          </div>
          
          {scholarship.deadline && (
            <div className="flex items-center space-x-1">
              <FiClock size={14} />
              <span>Due {new Date(scholarship.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2 mt-6">
        <Link href={`/scholarships/${scholarship.id}`} className="flex-1">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
          >
            <FiInfo size={14} className="mr-2" />
            Details
          </Button>
        </Link>
        
        {hasApplied ? (
          <Button 
            size="sm"
            onClick={handleViewApplicationClick}
            variant="outline"
            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <FiFileText size={14} className="mr-2" />
            View Application
          </Button>
        ) : (
          <Button 
            size="sm"
            onClick={handleApplyClick}
            className="flex-1 bg-primary text-white hover:bg-primary-light"
          >
            Apply Now
            <FiArrowRight size={14} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface FilterSectionProps {
  filters: {
    search: string;
    deadline: 'week' | 'month' | 'quarter' | 'all';
    status?: 'all' | 'applied' | 'not_applied';
    minAmount?: number;
    maxAmount?: number;
  };
  updateFilters: (updates: Partial<{ 
    search: string; 
    deadline: 'week' | 'month' | 'quarter' | 'all';
    status?: 'all' | 'applied' | 'not_applied';
    minAmount?: number;
    maxAmount?: number;
  }>) => void;
}

function FilterSection({ filters, updateFilters }: FilterSectionProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const handleLocalFilterChange = (updates: Partial<typeof filters>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="bg-white border-2 shadow-md rounded-md p-6" style={{ borderColor: 'rgb(146,169,129)' }}>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="🔍 Search scholarships by name, description, or requirements..."
              value={localFilters.search}
              onChange={(e) => handleLocalFilterChange({ search: e.target.value })}
              className="border-accent-dark"
            />
          </div>
          
          <select
            value={localFilters.deadline}
            onChange={(e) => handleLocalFilterChange({ deadline: e.target.value as any })}
            className="px-3 py-2 border border-accent-dark rounded-md bg-white text-primary-dark"
          >
            <option value="all">All Deadlines</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          <select
            value={localFilters.status || 'all'}
            onChange={(e) => handleLocalFilterChange({ status: e.target.value as any })}
            className="px-3 py-2 border border-accent-dark rounded-md bg-white text-primary-dark"
          >
            <option value="all">All Scholarships</option>
            <option value="applied">Applied</option>
            <option value="not_applied">Not Applied</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function ApplicantScholarshipsPage() {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    search: '',
    deadline: 'all',
    status: 'all',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const { scholarships, loading, error } = useActiveScholarships();

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Filter scholarships based on current filters
  const filteredScholarships = scholarships.filter(scholarship => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (
        !scholarship.name.toLowerCase().includes(searchTerm) &&
        !scholarship.description?.toLowerCase().includes(searchTerm) &&
        !scholarship.requirements?.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }

    // Amount filters
    if (filters.minAmount && scholarship.amount && scholarship.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount && scholarship.amount && scholarship.amount > filters.maxAmount) {
      return false;
    }

    // Deadline filter
    if (filters.deadline !== 'all' && scholarship.deadline) {
      const deadlineDate = new Date(scholarship.deadline);
      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.deadline) {
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
        case 'quarter':
          if (diffDays > 90) return false;
          break;
      }
    }

    // Status filter (TODO: implement actual application status check)
    if (filters.status !== 'all') {
      // This would check against user's actual applications
      // For now, showing all scholarships
    }

    return true;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-2 border-accent-dark rounded-lg p-8 text-center">
            <p className="text-error">Error loading scholarships: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Scholarship Opportunities
              </h1>
              {loading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-4" />
              )}
            </div>
            <p className="text-lg text-primary-dark max-w-2xl mx-auto">
              Browse and apply for scholarships. Track your application status and find new opportunities.
            </p>
          </div>

          <FilterSection filters={filters} updateFilters={updateFilters} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && scholarships.length === 0 ? (
              Array.from({ length: 6 }).map((_, index) => (
                <ScholarshipCardSkeleton key={index} />
              ))
            ) : filteredScholarships.length > 0 ? (
              filteredScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-primary-dark text-lg">
                  No scholarships found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}