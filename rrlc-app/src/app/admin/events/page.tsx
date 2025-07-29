"use client";
import { useState } from "react";
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
import { FiPlus, FiEdit2, FiUsers } from "react-icons/fi";
import Link from "next/link";
import { useEvents, useEventStats } from "@/hooks/useEvents";
import { CreateEventData, UpdateEventData } from "@/types/database";

export default function EventsPage() {
  const toaster = createToaster({
    placement: 'top',
  });
  const { events, loading, error, createEvent, updateEvent } = useEvents();
  const { stats } = useEventStats();
  
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<CreateEventData>({ 
    name: '', 
    description: '', 
    event_date: '', 
    event_type: 'conference', 
    capacity: 100 
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setForm({ name: '', description: '', event_date: '', event_type: 'conference', capacity: 100 });
    setIsEditing(false);
    setSelected(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: any) => {
    setForm({
      name: event.name,
      description: event.description || '',
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
    setSubmitting(true);
    
    try {
      if (isEditing && selected) {
        const updateData: UpdateEventData = {
          id: selected.id,
          ...form
        };
        await updateEvent(updateData);
        toaster.create({
          title: "Event updated successfully",
          duration: 3000,
        });
      } else {
        await createEvent(form);
        toaster.create({
          title: "Event created successfully",
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'blue';
      case 'workshop': return 'purple';
      case 'networking': return 'green';
      case 'award_ceremony': return 'yellow';
      case 'other': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white" borderColor="gray.300">
      <Heading mb={2} color="black">Event Management</Heading>
      <Box mb={6} color="gray.700" fontWeight="medium">
        Total events: {events.length} | Total registrations: {stats ? stats.totalRegistrations : 0}
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
                    <Text color={event.current_registrations >= event.capacity ? "red.600" : "green.600"}>
                      {event.current_registrations}/{event.capacity}
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
                      bg="rgb(146,169,129)"
                      color="rgb(78,61,30)"
                      _placeholder={{ color: "gray.500", opacity: 0.8 }}
                      borderColor="rgb(146,169,129)"
                    />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Description</Text>
                    <Input 
                      value={form.description} 
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Enter event description"
                      bg="rgb(146,169,129)"
                      color="rgb(78,61,30)"
                      _placeholder={{ color: "gray.500", opacity: 0.8 }}
                      borderColor="rgb(146,169,129)"
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
                      onChange={e => setForm(f => ({ ...f, event_type: e.target.value as any }))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', color: '#374151' }}
                    >
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="networking">Networking</option>
                      <option value="award_ceremony">Award Ceremony</option>
                      <option value="other">Other</option>
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
                      bg="rgb(146,169,129)"
                      color="rgb(78,61,30)"
                      _placeholder={{ color: "gray.500", opacity: 0.8 }}
                      borderColor="rgb(146,169,129)"
                    />
                  </Box>
                </Stack>
              </Box>
              <Box p={6} borderTop="1px" borderColor="gray.300" bg="gray.100">
                <Stack direction="row" gap={3} justify="flex-end">
                  <Button onClick={handleCloseModal} variant="ghost" disabled={submitting}>Cancel</Button>
                  <Button colorScheme="teal" type="submit" loading={submitting}>
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