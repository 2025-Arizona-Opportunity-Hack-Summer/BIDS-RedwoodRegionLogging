"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCopy, 
  FiSearch,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
  FiFileText
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { updateScholarship, deleteScholarship, isScholarshipExpired } from "@/services/scholarships";
import { Scholarship } from "@/types/database";
import { useScholarshipContext } from "@/contexts/AdminContext";

interface ScholarshipActionsProps {
  scholarship: Scholarship;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function ScholarshipActions({ scholarship, onEdit, onDuplicate, onToggleStatus, onDelete }: ScholarshipActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

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
              onEdit();
              setShowMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
          >
            <FiEdit2 size={14} />
            Edit
          </button>
          
          <button
            onClick={() => {
              onDuplicate();
              setShowMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
          >
            <FiCopy size={14} />
            Duplicate
          </button>
          
          <button
            onClick={() => {
              onToggleStatus();
              setShowMenu(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 w-full text-left text-sm ${
              scholarship.status === 'inactive' && isScholarshipExpired(scholarship.deadline)
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 cursor-pointer'
            }`}
            disabled={scholarship.status === 'inactive' && isScholarshipExpired(scholarship.deadline)}
            title={scholarship.status === 'inactive' && isScholarshipExpired(scholarship.deadline) 
              ? 'Cannot activate scholarship with past due date' 
              : ''}
          >
            {scholarship.status === 'active' ? <FiEyeOff size={14} /> : <FiEye size={14} />}
            {scholarship.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          
          <div className="border-t my-2" />
          
          <button
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left text-sm"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function AdminScholarshipsContent() {
  const router = useRouter();
  const { scholarships, loading, isRefreshing, refreshScholarships, updateScholarshipInCache, removeScholarshipFromCache } = useScholarshipContext();
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "closed">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scholarshipToDelete, setScholarshipToDelete] = useState<Scholarship | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    filterScholarships();
  }, [scholarships, searchQuery, statusFilter]);

  // Trigger a background refresh when component mounts (for navigation from other pages)
  useEffect(() => {
    if (scholarships.length > 0) {
      // If we already have data, do a background refresh
      refreshScholarships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterScholarships = () => {
    let filtered = scholarships;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    setFilteredScholarships(filtered);
  };

  const handleEdit = (scholarship: Scholarship) => {
    router.push(`/admin/scholarships/${scholarship.id}/edit`);
  };

  const handleDuplicate = (scholarship: Scholarship) => {
    router.push(`/admin/scholarships/new?duplicate=${scholarship.id}`);
  };

  const handleToggleStatus = async (scholarship: Scholarship) => {
    // Prevent activation of expired scholarships
    if (scholarship.status === 'inactive' && isScholarshipExpired(scholarship.deadline)) {
      alert('Cannot activate scholarship with a past due date. Please edit the scholarship and set a future deadline.');
      return;
    }
    
    const newStatus = scholarship.status === 'active' ? 'inactive' : 'active';
    const { data, error } = await updateScholarship({ 
      id: scholarship.id, 
      status: newStatus 
    });
    
    if (error) {
      alert(error);
    } else if (data) {
      updateScholarshipInCache(data);
    }
  };

  const handleDelete = (scholarship: Scholarship) => {
    setScholarshipToDelete(scholarship);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!scholarshipToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await deleteScholarship(scholarshipToDelete.id);
      if (!error) {
        removeScholarshipFromCache(scholarshipToDelete.id);
        setShowDeleteModal(false);
        setScholarshipToDelete(null);
      } else {
        alert(`Error deleting scholarship: ${error}`);
      }
    } catch (error) {
      alert(`Error deleting scholarship: ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setScholarshipToDelete(null);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Varies";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Only show loading skeleton if we're loading and have no data yet
  if (loading && scholarships.length === 0) {
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
                  Scholarship Management
                </h1>
                {isRefreshing && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
                )}
              </div>
            </div>
            
            <Link href="/admin/scholarships/new">
              <Button className="bg-primary text-white hover:bg-primary-light">
                <FiPlus className="mr-2" />
                Create New Scholarship
              </Button>
            </Link>
          </div>
          
          {/* Filters */}
          <Card className="bg-white border-2 border-accent-dark p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search scholarships..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </Card>
          
          {/* Scholarships List */}
          {filteredScholarships.length === 0 ? (
            <Card className="bg-white border-2 border-accent-dark p-8 text-center">
              <p className="text-primary-dark">
                {searchQuery || statusFilter !== "all" 
                  ? "No scholarships found matching your filters."
                  : "No scholarships created yet. Click 'Create New Scholarship' to get started."}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredScholarships.map((scholarship) => (
                <Card 
                  key={scholarship.id} 
                  className="bg-white border-2 border-accent-dark p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-primary">
                          {scholarship.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isScholarshipExpired(scholarship.deadline) && scholarship.status === 'active' 
                            ? 'bg-orange-100 text-orange-800' 
                            : getStatusColor(scholarship.status)
                        }`}>
                          {isScholarshipExpired(scholarship.deadline) && scholarship.status === 'active' 
                            ? 'expired' 
                            : scholarship.status}
                        </span>
                      </div>
                      
                      <p className="text-primary-dark mb-3 line-clamp-2">
                        {scholarship.description || "No description provided"}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FiDollarSign className="text-secondary" size={16} />
                          <span className="font-medium">{formatCurrency(scholarship.amount)}</span>
                        </div>
                        
                        {scholarship.deadline && (
                          <div className={`flex items-center gap-1 ${
                            isScholarshipExpired(scholarship.deadline) ? 'text-orange-600' : ''
                          }`}>
                            <FiCalendar className={
                              isScholarshipExpired(scholarship.deadline) ? 'text-orange-600' : 'text-secondary'
                            } size={16} />
                            <span>
                              Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                              {isScholarshipExpired(scholarship.deadline) && ' (Past due)'}
                            </span>
                          </div>
                        )}
                        
                        {scholarship.custom_fields && scholarship.custom_fields.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FiFileText className="text-secondary" size={16} />
                            <span>{scholarship.custom_fields.length} custom fields</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ScholarshipActions
                      scholarship={scholarship}
                      onEdit={() => handleEdit(scholarship)}
                      onDuplicate={() => handleDuplicate(scholarship)}
                      onToggleStatus={() => handleToggleStatus(scholarship)}
                      onDelete={() => handleDelete(scholarship)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Scholarship"
        message={`Are you sure you want to permanently delete "${scholarshipToDelete?.name}"? This action cannot be undone and will remove the scholarship from the database.`}
        confirmText="Delete Scholarship"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function AdminScholarshipsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminScholarshipsContent />
    </ProtectedRoute>
  );
}