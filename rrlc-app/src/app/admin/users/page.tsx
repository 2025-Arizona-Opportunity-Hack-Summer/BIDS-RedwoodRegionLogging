"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { saveAs } from "file-saver";
import { Profile } from "@/types/database";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";

// Icons
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UsersIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

interface UserFormData {
  full_name: string;
  email: string;
  role: 'admin' | 'applicant' | 'reviewer';
  password?: string;
}

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [form, setForm] = useState<UserFormData>({ 
    full_name: "", 
    email: "", 
    role: "applicant" 
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { addToast } = useToast();

  // Data fetching
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      addToast({
        title: "Error fetching users",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Real-time profile change:', payload);
          // Refresh the user list when any profile changes
          fetchUsers();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === "" || 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      applicants: users.filter(u => u.role === 'applicant').length,
      reviewers: users.filter(u => u.role === 'reviewer').length,
    };
  }, [users]);

  // Event handlers
  const handleOpenAdd = () => {
    setForm({ full_name: "", email: "", role: "applicant", password: "" });
    setFormErrors({});
    setIsEditing(false);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Profile) => {
    setForm({ 
      full_name: user.full_name || "", 
      email: user.email || "", 
      role: user.role 
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleViewDetails = (user: Profile) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};
    
    if (!form.full_name.trim()) {
      errors.full_name = "Name is required";
    }
    
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!isEditing && !form.password) {
      errors.password = "Password is required for new users";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDelete = async (user: Profile) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone and will prevent them from logging in.`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/admin/users/delete?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        addToast({
          title: "Error deleting user",
          description: result.error || 'Failed to delete user',
          type: "error",
          duration: 5000,
        });
      } else {
        addToast({
          title: "User deleted",
          description: "User has been completely deleted and can no longer log in",
          type: "success",
          duration: 3000,
        });
        // No need to call fetchUsers() - real-time subscription will handle the update
      }
    } catch (error) {
      addToast({
        title: "Error deleting user",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    if (isEditing && selectedUser) {
      // Update existing user
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedUser.id);
      
      if (error) {
        addToast({
          title: "Error updating user",
          description: error.message,
          type: "error",
          duration: 5000,
        });
      } else {
        addToast({
          title: "User updated",
          description: "User has been successfully updated",
          type: "success",
          duration: 3000,
        });
        fetchUsers();
        setIsModalOpen(false);
      }
    } else {
      // Create new user with auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password!,
        options: {
          data: {
            full_name: form.full_name,
          }
        }
      });
      
      if (authError || !authData.user) {
        addToast({
          title: "Error creating user",
          description: authError?.message || "Failed to create user",
          type: "error",
          duration: 5000,
        });
      } else {
        // Update the profile with the correct role
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            role: form.role,
            full_name: form.full_name
          })
          .eq("id", authData.user.id);
        
        if (profileError) {
          addToast({
            title: "Warning",
            description: "User created but role update failed",
            type: "warning",
            duration: 5000,
          });
        } else {
          addToast({
            title: "User created",
            description: "User has been successfully created",
            type: "success",
            duration: 3000,
          });
        }
        
        fetchUsers();
        setIsModalOpen(false);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} users? This action cannot be undone and will prevent them from logging in.`
    );
    
    if (!confirmed) return;
    
    try {
      const userIds = Array.from(selectedUsers);
      
      const response = await fetch(`/api/admin/users/delete?userIds=${JSON.stringify(userIds)}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        addToast({
          title: "Error deleting users",
          description: result.error || 'Failed to delete users',
          type: "error",
          duration: 5000,
        });
      } else {
        if (result.failedCount > 0) {
          addToast({
            title: "Partial deletion completed",
            description: result.message,
            type: "warning",
            duration: 5000,
          });
        } else {
          addToast({
            title: "Users deleted",
            description: result.message,
            type: "success",
            duration: 3000,
          });
        }
      }
      
      setSelectedUsers(new Set());
      // No need to call fetchUsers() - real-time subscription will handle the update
    } catch (error) {
      addToast({
        title: "Error deleting users",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: "error",
        duration: 5000,
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const exportCSV = () => {
    const csvRows = [
      ["ID", "Name", "Email", "Role", "Created At", "Updated At"],
      ...filteredUsers.map(u => [
        u.id,
        u.full_name || "",
        u.email || "",
        u.role,
        new Date(u.created_at).toLocaleString(),
        new Date(u.updated_at).toLocaleString()
      ])
    ];
    const csvContent = csvRows
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `users-export-${new Date().toISOString().slice(0,10)}.csv`);
    
    addToast({
      title: "Export successful",
      description: `Exported ${filteredUsers.length} users to CSV`,
      type: "success",
      duration: 3000,
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'reviewer':
        return 'purple';
      case 'applicant':
        return 'blue';
      default:
        return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return ShieldCheckIcon;
      case 'reviewer':
        return UserGroupIcon;
      case 'applicant':
        return UserIcon;
      default:
        return UserIcon;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">User Management</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Tooltip content="Refresh data">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchUsers}
              disabled={loading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </Tooltip>
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={filteredUsers.length === 0}
            leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleOpenAdd}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-400">All registered users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                <p className="text-xs text-gray-400">System administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Applicants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applicants}</p>
                <p className="text-xs text-gray-400">Scholarship applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reviewers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviewers}</p>
                <p className="text-xs text-gray-400">Application reviewers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table with Search */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex justify-center items-center">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredUsers.length === 0 && searchQuery === "" && roleFilter === "all" ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-2 text-gray-500">Add your first user to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="applicant">Applicants</option>
                <option value="reviewer">Reviewers</option>
              </select>
              
              {selectedUsers.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  leftIcon={<TrashIcon className="h-4 w-4" />}
                >
                  Delete Selected ({selectedUsers.size})
                </Button>
              )}
            </div>
          </div>

          {/* Table Content */}
          {filteredUsers.length === 0 ? (
            <CardContent className="p-12">
              <div className="text-center">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No users found matching your filters
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                  }}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              </div>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length}
                        onChange={toggleAllUsers}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar 
                              name={user.full_name || user.email} 
                              src={user.avatar_url} 
                              size="sm" 
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {user.full_name || "Unnamed User"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center w-fit">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Tooltip content="View details">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(user)}
                              >
                                <UserIcon className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Edit user">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(user)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete user">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing ? "Edit User" : "Add New User"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Enter full name"
                  error={!!formErrors.full_name}
                />
                {formErrors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  disabled={isEditing}
                  error={!!formErrors.email}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    value={form.password || ""}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    error={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as ('admin' | 'applicant' | 'reviewer') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="applicant">Applicant</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title="User Details"
        size="lg"
      >
        <ModalBody>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar
                  name={selectedUser.full_name || selectedUser.email}
                  src={selectedUser.avatar_url}
                  size="lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.full_name || "Unnamed User"}
                  </h3>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">User ID</p>
                      <p className="text-sm text-gray-500 font-mono">{selectedUser.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Created</p>
                      <p className="text-sm text-gray-900">{new Date(selectedUser.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated</p>
                      <p className="text-sm text-gray-900">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsDetailsModalOpen(false)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}