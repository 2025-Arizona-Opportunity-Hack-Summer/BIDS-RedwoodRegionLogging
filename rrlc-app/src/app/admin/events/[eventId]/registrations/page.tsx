"use client";

import { useEffect, useState, useCallback } from "react";
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
  Badge
} from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiArrowLeft } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  registration_date: string;
  attendance_status: string;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  event_date: string;
  capacity: number;
  registered_count: number;
}

const showToast = (message: string, type: 'success' | 'error') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
};

export default function EventRegistrationsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EventRegistration | null>(null);
  const [form, setForm] = useState({ 
    user_name: '', 
    user_email: '', 
    attendance_status: 'registered' 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchEvent = useCallback(async () => {
    const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();
    if (error) {
      showToast("Error fetching event", "error");
    } else {
      setEvent(data);
    }
  }, [eventId]);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    // For now, using mock data until we create the event_registrations table
    const mockRegistrations: EventRegistration[] = [
      {
        id: '1',
        event_id: eventId,
        user_id: 'user1',
        user_name: 'John Doe',
        user_email: 'john@example.com',
        registration_date: '2024-01-15',
        attendance_status: 'registered',
        created_at: '2024-01-15'
      },
      {
        id: '2',
        event_id: eventId,
        user_id: 'user2',
        user_name: 'Jane Smith',
        user_email: 'jane@example.com',
        registration_date: '2024-01-16',
        attendance_status: 'attended',
        created_at: '2024-01-16'
      }
    ];
    setRegistrations(mockRegistrations);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchRegistrations();
    }
  }, [eventId, fetchEvent, fetchRegistrations]);

  const handleOpenAdd = () => {
    setForm({ user_name: '', user_email: '', attendance_status: 'registered' });
    setIsEditing(false);
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (registration: EventRegistration) => {
    setForm({
      user_name: registration.user_name,
      user_email: registration.user_email,
      attendance_status: registration.attendance_status
    });
    setIsEditing(true);
    setSelected(registration);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selected) {
      // Update registration (mock for now)
      showToast("Registration updated (mock)", "success");
      setIsModalOpen(false);
      fetchRegistrations();
    } else {
      // Create registration (mock for now)
      showToast("Registration created (mock)", "success");
      setIsModalOpen(false);
      fetchRegistrations();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'attended': return 'green';
      case 'registered': return 'blue';
      case 'cancelled': return 'red';
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
        Attended: {registrations.filter(r => r.attendance_status === 'attended').length}
      </Box>
      
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
                    <Text fontWeight="medium">{registration.user_name}</Text>
                  </Box>
                  <Box flex="3">
                    <Text>{registration.user_email}</Text>
                  </Box>
                  <Box flex="2">
                    <Text>{new Date(registration.registration_date).toLocaleDateString()}</Text>
                  </Box>
                  <Box flex="1">
                    <Badge colorScheme={getAttendanceColor(registration.attendance_status)}>
                      {registration.attendance_status}
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
                      onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Email</Text>
                    <Input 
                      type="email" 
                      value={form.user_email} 
                      onChange={e => setForm(f => ({ ...f, user_email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Attendance Status</Text>
                    <select
                      value={form.attendance_status}
                      onChange={e => setForm(f => ({ ...f, attendance_status: e.target.value }))}
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