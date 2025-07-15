"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Spinner,
  IconButton,
  Input,
  Stack,
  Text,
  CloseButton
} from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { saveAs } from "file-saver";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

// Simple toast notification
const showToast = (message: string, type: 'success' | 'error') => {
  // You could implement a proper toast system here
  // For now, using console and could be replaced with a toast library
  console.log(`${type.toUpperCase()}: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", role: "member" });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) {
      showToast("Error fetching users", "error");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setForm({ full_name: "", email: "", role: "member" });
    setIsEditing(false);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setForm({ full_name: user.full_name, email: user.email, role: user.role });
    setIsEditing(true);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.full_name}?`)) return;
    const { error } = await supabase.from("users").delete().eq("id", user.id);
    if (error) {
      showToast("Error deleting user", "error");
    } else {
      showToast("User deleted", "success");
      fetchUsers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedUser) {
      // Update
      const { error } = await supabase.from("users").update(form).eq("id", selectedUser.id);
      if (error) {
        showToast("Error updating user", "error");
      } else {
        showToast("User updated", "success");
        fetchUsers();
        setIsModalOpen(false);
      }
    } else {
      // Create
      const { error } = await supabase.from("users").insert([form]);
      if (error) {
        showToast("Error creating user", "error");
      } else {
        showToast("User created", "success");
        fetchUsers();
        setIsModalOpen(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // CSV export utility
  const exportCSV = () => {
    const csvRows = [
      ["Name", "Email", "Role", "Created"],
      ...users.map(u => [u.full_name, u.email, u.role, u.created_at])
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `users-${new Date().toISOString().slice(0,10)}.csv`);
  };

  // Basic stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white" borderColor="gray.300">
      <Heading mb={2} color="black">User Management</Heading>
      <Box mb={6} color="gray.700" fontWeight="medium">
        Total users: {totalUsers} | Admins: {totalAdmins}
      </Box>
      <Button colorScheme="gray" size="sm" mb={4} onClick={exportCSV} mr={2}>Export CSV</Button>
      
      <Button 
        colorScheme="teal" 
        mb={4} 
        onClick={handleOpenAdd}
        size="md"
      >
        <FiPlus style={{ marginRight: '8px' }} />
        Add User
      </Button>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box overflowX="auto">
          {/* Custom Table */}
          <Box border="1px" borderColor="gray.300" borderRadius="md" bg="white">
            {/* Header */}
            <Box bg="gray.100" p={4} borderBottom="1px" borderColor="gray.300">
              <Stack direction="row" align="center" fontSize="sm" fontWeight="semibold">
                <Box flex="2" color="black">Name</Box>
                <Box flex="3" color="black">Email</Box>
                <Box flex="1" color="black">Role</Box>
                <Box flex="2" color="black">Created</Box>
                <Box flex="1" color="black">Actions</Box>
              </Stack>
            </Box>
            
            {/* Body */}
            {users.map((user, index) => (
              <Box 
                key={user.id} 
                p={4} 
                borderBottom={index < users.length - 1 ? "1px" : "none"} 
                borderColor="gray.300"
                _hover={{ bg: "gray.50" }}
                bg="white"
              >
                <Stack direction="row" align="center" fontSize="sm">
                  <Box flex="2">{user.full_name}</Box>
                  <Box flex="3">{user.email}</Box>
                  <Box flex="1">
                    <Text 
                      px={2} 
                      py={1} 
                      bg={user.role === 'admin' ? 'red.100' : 'blue.100'}
                      color={user.role === 'admin' ? 'red.800' : 'blue.800'}
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                      display="inline-block"
                    >
                      {user.role}
                    </Text>
                  </Box>
                  <Box flex="2">{new Date(user.created_at).toLocaleString()}</Box>
                  <Box flex="1">
                    <Stack direction="row" gap={2}>
                      <IconButton 
                        aria-label="Edit" 
                        size="sm" 
                        onClick={() => handleOpenEdit(user)}
                        variant="ghost"
                        colorScheme="blue"
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton 
                        aria-label="Delete" 
                        size="sm" 
                        colorScheme="red" 
                        onClick={() => handleDelete(user)}
                        variant="ghost"
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ))}
            
            {users.length === 0 && (
              <Box p={8} textAlign="center" color="gray.500" bg="white">
                No users found. Add your first user to get started.
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Custom Modal */}
      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            maxW="md"
            w="full"
            mx={4}
            maxH="90vh"
            overflowY="auto"
            border="1px"
            borderColor="gray.300"
          >
            {/* Modal Header */}
            <Box p={6} borderBottom="1px" borderColor="gray.300" bg="gray.100">
              <Stack direction="row" align="center" justify="space-between">
                <Heading size="lg">{isEditing ? "Edit User" : "Add User"}</Heading>
                <CloseButton onClick={handleCloseModal} />
              </Stack>
            </Box>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <Box p={6} bg="white">
                <Stack gap={4}>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">
                      Name <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input 
                      value={form.full_name} 
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">
                      Email <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">
                      Role <Text as="span" color="red.500">*</Text>
                    </Text>
                    <select
                      value={form.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                        setForm(f => ({ ...f, role: e.target.value }))
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </Box>
                </Stack>
              </Box>

              {/* Modal Footer */}
              <Box p={6} borderTop="1px" borderColor="gray.300" bg="gray.100">
                <Stack direction="row" gap={3} justify="flex-end">
                  <Button onClick={handleCloseModal} variant="ghost">
                    Cancel
                  </Button>
                  <Button colorScheme="teal" type="submit">
                    {isEditing ? "Update" : "Create"}
                  </Button>
                </Stack>
              </Box>
            </form>
          </Box>
        </Box>
      )}
    </Box>
  );
}