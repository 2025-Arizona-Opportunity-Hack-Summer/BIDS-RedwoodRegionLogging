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
  CloseButton,
  Badge
} from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiUsers, FiCalendar } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  event_type: string;
  capacity: number;
  registered_count: number;
  created_at: string;
}

const showToast = (message: string, type: 'success' | 'error') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Event | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    event_date: '', 
    event_type: 'conference', 
    capacity: 100 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (error) {
      showToast("Error fetching events", "error");
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    setForm({ name: '', description: '', event_date: '', event_type: 'conference', capacity: 100 });
    setIsEditing(false);
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setForm({
      name: event.name,
      description: event.description,
      event_date: event.event_date,
      event_type: event.event_type,
      capacity: event.capacity
    });
    setIsEditing(true);
    setSelected(event);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selected) {
      // Update event
      const { error } = await supabase.from("events").update({
        name: form.name,
        description: form.description,
        event_date: form.event_date,
        event_type: form.event_type,
        capacity: form.capacity
      }).eq("id", selected.id);
      if (error) {
        showToast("Error updating event", "error");
      } else {
        showToast("Event updated", "success");
        setIsModalOpen(false);
        fetchEvents();
      }
    } else {
      // Create event
      const { error } = await supabase.from("events").insert([{
        name: form.name,
        description: form.description,
        event_date: form.event_date,
        event_type: form.event_type,
        capacity: form.capacity,
        registered_count: 0
      }]);
      if (error) {
        showToast("Error creating event", "error");
      } else {
        showToast("Event created", "success");
        setIsModalOpen(false);
        fetchEvents();
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'blue';
      case 'education': return 'green';
      case 'workshop': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white" borderColor="gray.300">
      <Heading mb={2} color="black">Event Management</Heading>
      <Box mb={6} color="gray.700" fontWeight="medium">
        Total events: {events.length} | Total registrations: {events.reduce((sum, e) => sum + e.registered_count, 0)}
      </Box>
      
      <Button 
        colorScheme="teal" 
        mb={4} 
        onClick={handleOpenAdd}
        size="md"
        leftIcon={<FiPlus />}
      >
        Add Event
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
                <Box flex="2" color="black">Event Name</Box>
                <Box flex="1" color="black">Type</Box>
                <Box flex="1" color="black">Date</Box>
                <Box flex="1" color="black">Capacity</Box>
                <Box flex="1" color="black">Registered</Box>
                <Box flex="1" color="black">Actions</Box>
              </Stack>
            </Box>
            
            {events.map((event, idx) => (
              <Box
                key={event.id}
                p={4}
                borderBottom={idx < events.length - 1 ? "1px" : "none"}
                borderColor="gray.300"
                _hover={{ bg: "gray.50" }}
                bg="white"
              >
                <Stack direction="row" align="center" fontSize="sm">
                  <Box flex="2">
                    <Text fontWeight="medium">{event.name}</Text>
                    <Text color="gray.600" fontSize="xs">{event.description}</Text>
                  </Box>
                  <Box flex="1">
                    <Badge colorScheme={getEventTypeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </Box>
                  <Box flex="1">
                    <Text>{new Date(event.event_date).toLocaleDateString()}</Text>
                  </Box>
                  <Box flex="1">
                    <Text>{event.capacity}</Text>
                  </Box>
                  <Box flex="1">
                    <Text color={event.registered_count >= event.capacity ? "red.600" : "green.600"}>
                      {event.registered_count}/{event.capacity}
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Stack direction="row" gap={2}>
                      <IconButton 
                        aria-label="Edit" 
                        size="sm" 
                        onClick={() => handleOpenEdit(event)} 
                        variant="ghost" 
                        colorScheme="blue"
                      >
                        <FiEdit2 />
                      </IconButton>
                      <Link href={`/admin/events/${event.id}/registrations`}>
                        <IconButton 
                          aria-label="View Registrations" 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="green"
                        >
                          <FiUsers />
                        </IconButton>
                      </Link>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ))}
            
            {events.length === 0 && (
              <Box p={8} textAlign="center" color="gray.500" bg="white">
                No events found. Add your first event to get started.
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Event Modal */}
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
                <Heading size="lg">{isEditing ? "Edit Event" : "Add Event"}</Heading>
                <CloseButton onClick={handleCloseModal} />
              </Stack>
            </Box>
            <form onSubmit={handleSubmit}>
              <Box p={6} bg="white">
                <Stack gap={4}>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Event Name</Text>
                    <Input 
                      value={form.name} 
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Enter event name"
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Description</Text>
                    <Input 
                      value={form.description} 
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Enter event description"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Event Date</Text>
                    <Input 
                      type="date" 
                      value={form.event_date} 
                      onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Event Type</Text>
                    <select
                      value={form.event_type}
                      onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', color: '#374151' }}
                    >
                      <option value="conference">Conference</option>
                      <option value="education">Education Day</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Capacity</Text>
                    <Input 
                      type="number" 
                      value={form.capacity} 
                      onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter capacity"
                      min={1}
                      required
                      bg="white"
                      borderColor="gray.300"
                    />
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