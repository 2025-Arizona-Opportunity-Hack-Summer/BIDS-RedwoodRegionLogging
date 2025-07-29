"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Spinner,
  IconButton,
  Input,
  Stack,
  Text,
  CloseButton,
  Badge,
  createToaster
} from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useEvent, useEventRegistrations } from "@/hooks/useEvents";
import { CreateEventRegistrationData, UpdateEventRegistrationData } from "@/types/database";

export default function EventRegistrationsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const toaster = createToaster({
    placement: 'top',
  });
  
  const { event, loading: eventLoading } = useEvent(eventId);
  const { 
    registrations, 
    loading: registrationsLoading, 
    error, 
    createRegistration, 
    updateRegistration
  } = useEventRegistrations(eventId);
  
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>({ 
    user_id: '', 
    registration_status: 'registered',
    payment_status: 'pending',
    notes: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loading = eventLoading || registrationsLoading;

  const handleOpenAdd = () => {
    setForm({ 
      user_id: '', 
      registration_status: 'registered',
      payment_status: 'pending',
      notes: ''
    });
    setIsEditing(false);
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (registration: any) => {
    setForm({
      user_id: registration.user_id,
      registration_status: registration.registration_status,
      payment_status: registration.payment_status,
      notes: registration.notes || ''
    });
    setIsEditing(true);
    setSelected(registration);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && selected) {
        const updateData: UpdateEventRegistrationData = {
          id: selected.id,
          ...form
        };
        await updateRegistration(updateData);
        toaster.create({
          title: "Registration updated successfully",
          duration: 3000,
        });
      } else {
        const createData: CreateEventRegistrationData = {
          event_id: eventId,
          ...form
        };
        await createRegistration(createData);
        toaster.create({
          title: "Registration created successfully",
          duration: 3000,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toaster.create({
        title: "Error",
        description: (error as Error).message,
        duration: 5000,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return 'green';
      case 'registered': return 'blue';
      case 'cancelled': return 'red';
      case 'no_show': return 'orange';
      default: return 'gray';
    }
  };

  if (!event) {
    return (
      <Box display="flex" justifyContent="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white" borderColor="gray.300">
      <Stack direction="row" align="center" mb={4}>
        <Link href="/admin/events">
          <IconButton aria-label="Back to events" variant="ghost" size="sm"><FiArrowLeft /></IconButton>
        </Link>
        <Heading size="lg" color="black">{event.name} - Registrations</Heading>
      </Stack>
      
      <Box mb={6} color="gray.700" fontWeight="medium">
        Event Date: {new Date(event.event_date).toLocaleDateString()} | 
        Capacity: {event.capacity} | 
        Registered: {registrations.length} | 
        Attended: {registrations.filter(r => r.registration_status === 'attended').length}
      </Box>
      
      {error && (
        <Box mb={4} p={4} bg="red.50" borderColor="red.200" borderWidth={1} borderRadius="md">
          <Text color="red.600">{error}</Text>
        </Box>
      )}
      
      <Button 
        colorScheme="teal" 
        mb={4} 
        onClick={handleOpenAdd}
        size="md"
      >
        <FiPlus style={{ marginRight: '8px' }} />
        Add Registration
      </Button>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box overflowX="auto">
          <Box border="1px" borderColor="gray.300" borderRadius="md" bg="white">
            <Box bg="gray.100" p={4} borderBottom="1px" borderColor="gray.300">
              <Stack direction="row" align="center" fontSize="sm" fontWeight="semibold">
                <Box flex="2" color="black">Name</Box>
                <Box flex="3" color="black">Email</Box>
                <Box flex="2" color="black">Registration Date</Box>
                <Box flex="1" color="black">Status</Box>
                <Box flex="1" color="black">Actions</Box>
              </Stack>
            </Box>
            
            {registrations.map((registration, idx) => (
              <Box
                key={registration.id}
                p={4}
                borderBottom={idx < registrations.length - 1 ? "1px" : "none"}
                borderColor="gray.300"
                _hover={{ bg: "gray.50" }}
                bg="white"
              >
                <Stack direction="row" align="center" fontSize="sm">
                  <Box flex="2">
                    <Text fontWeight="medium">{registration.user?.full_name || 'Unknown User'}</Text>
                  </Box>
                  <Box flex="3">
                    <Text>{registration.user?.email || 'No email'}</Text>
                  </Box>
                  <Box flex="2">
                    <Text>{new Date(registration.registration_date).toLocaleDateString()}</Text>
                  </Box>
                  <Box flex="1">
                    <Badge colorScheme={getRegistrationStatusColor(registration.registration_status)}>
                      {registration.registration_status}
                    </Badge>
                  </Box>
                  <Box flex="1">
                    <IconButton 
                      aria-label="Edit" 
                      size="sm" 
                      onClick={() => handleOpenEdit(registration)} 
                      variant="ghost" 
                      colorScheme="blue"
                    >
                      <FiEdit2 />
                    </IconButton>
                  </Box>
                </Stack>
              </Box>
            ))}
            
            {registrations.length === 0 && (
              <Box p={8} textAlign="center" color="gray.500" bg="white">
                No registrations found for this event.
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Registration Modal */}
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
            <Box p={6} borderBottom="1px" borderColor="gray.300" bg="gray.100">
              <Stack direction="row" align="center" justify="space-between">
                <Heading size="lg">{isEditing ? "Edit Registration" : "Add Registration"}</Heading>
                <CloseButton onClick={handleCloseModal} />
              </Stack>
            </Box>
            <form onSubmit={handleSubmit}>
              <Box p={6} bg="white">
                <Stack gap={4}>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Name</Text>
                    <Input 
                      value={form.user_name} 
                      onChange={e => setForm((f: any) => ({ ...f, user_name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                      bg="rgb(146,169,129)"
                      color="rgb(78,61,30)"
                      _placeholder={{ color: "gray.500", opacity: 0.8 }}
                      borderColor="rgb(146,169,129)"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Email</Text>
                    <Input 
                      type="email" 
                      value={form.user_email} 
                      onChange={e => setForm((f: any) => ({ ...f, user_email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                      bg="rgb(146,169,129)"
                      color="rgb(78,61,30)"
                      _placeholder={{ color: "gray.500", opacity: 0.8 }}
                      borderColor="rgb(146,169,129)"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Attendance Status</Text>
                    <select
                      value={form.attendance_status}
                      onChange={e => setForm((f: any) => ({ ...f, attendance_status: e.target.value }))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', color: '#374151' }}
                    >
                      <option value="registered">Registered</option>
                      <option value="attended">Attended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </Box>
                </Stack>
              </Box>
              <Box p={6} borderTop="1px" borderColor="gray.300" bg="gray.100">
                <Stack direction="row" gap={3} justify="flex-end">
                  <Button onClick={handleCloseModal} variant="ghost">Cancel</Button>
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