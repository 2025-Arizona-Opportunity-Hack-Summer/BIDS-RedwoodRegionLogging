import { useState, useEffect, useCallback } from 'react';
import { Event, EventRegistration, CreateEventData, UpdateEventData, CreateEventRegistrationData, UpdateEventRegistrationData, EventWithRegistrations, EventRegistrationWithDetails } from '@/types/database';
import * as eventService from '@/services/events';

// Hook for managing all events (admin)
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await eventService.getAllEvents();
    
    if (fetchError) {
      setError('Failed to load events');
      console.error('Error fetching events:', fetchError);
    } else {
      setEvents(data || []);
    }
    
    setLoading(false);
  }, []);

  const createEvent = async (eventData: CreateEventData) => {
    const { data, error: createError } = await eventService.createEvent(eventData);
    
    if (createError) {
      throw new Error('Failed to create event');
    }
    
    // Refresh the list
    await fetchEvents();
    return data;
  };

  const updateEvent = async (eventData: UpdateEventData) => {
    const { data, error: updateError } = await eventService.updateEvent(eventData);
    
    if (updateError) {
      throw new Error('Failed to update event');
    }
    
    // Update local state optimistically
    setEvents(prev => 
      prev.map(e => e.id === eventData.id ? { ...e, ...eventData } : e)
    );
    
    return data;
  };

  const deleteEvent = async (id: string) => {
    const { success } = await eventService.deleteEvent(id);
    
    if (!success) {
      throw new Error('Failed to delete event');
    }
    
    // Update local state optimistically
    setEvents(prev => 
      prev.map(e => e.id === id ? { ...e, status: 'cancelled' as const } : e)
    );
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

// Hook for managing active events (public)
export function useActiveEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await eventService.getActiveEvents();
    
    if (fetchError) {
      setError('Failed to load events');
      console.error('Error fetching active events:', fetchError);
    } else {
      setEvents(data || []);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActiveEvents();
  }, [fetchActiveEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchActiveEvents,
  };
}

// Hook for managing single event
export function useEvent(id: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await eventService.getEventById(eventId);
    
    if (fetchError) {
      setError('Failed to load event');
      console.error('Error fetching event:', fetchError);
    } else {
      setEvent(data);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    } else {
      setEvent(null);
      setLoading(false);
      setError(null);
    }
  }, [id, fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: id ? () => fetchEvent(id) : () => {},
  };
}

// Hook for managing event with registrations
export function useEventWithRegistrations(id: string | null) {
  const [event, setEvent] = useState<EventWithRegistrations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventWithRegistrations = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await eventService.getEventWithRegistrations(eventId);
    
    if (fetchError) {
      setError('Failed to load event details');
      console.error('Error fetching event with registrations:', fetchError);
    } else {
      setEvent(data);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      fetchEventWithRegistrations(id);
    } else {
      setEvent(null);
      setLoading(false);
      setError(null);
    }
  }, [id, fetchEventWithRegistrations]);

  return {
    event,
    loading,
    error,
    refetch: id ? () => fetchEventWithRegistrations(id) : () => {},
  };
}

// Hook for event search
export function useEventSearch() {
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    const { data, error: searchError } = await eventService.searchEvents(query);
    
    if (searchError) {
      setError('Search failed');
      console.error('Error searching events:', searchError);
    } else {
      setResults(data || []);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

// Hook for managing event registrations
export function useEventRegistrations(eventId: string | null) {
  const [registrations, setRegistrations] = useState<EventRegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await eventService.getEventRegistrations(id);
    
    if (fetchError) {
      setError('Failed to load registrations');
      console.error('Error fetching event registrations:', fetchError);
    } else {
      setRegistrations(data || []);
    }
    
    setLoading(false);
  }, []);

  const createRegistration = async (registrationData: CreateEventRegistrationData) => {
    const { data, error: createError } = await eventService.createEventRegistration(registrationData);
    
    if (createError) {
      throw new Error(createError);
    }
    
    // Refresh the list
    if (eventId) {
      await fetchRegistrations(eventId);
    }
    return data;
  };

  const updateRegistration = async (registrationData: UpdateEventRegistrationData) => {
    const { data, error: updateError } = await eventService.updateEventRegistration(registrationData);
    
    if (updateError) {
      throw new Error('Failed to update registration');
    }
    
    // Update local state optimistically
    setRegistrations(prev => 
      prev.map(r => r.id === registrationData.id ? { ...r, ...registrationData } : r)
    );
    
    return data;
  };

  const cancelRegistration = async (id: string) => {
    const { success } = await eventService.cancelEventRegistration(id);
    
    if (!success) {
      throw new Error('Failed to cancel registration');
    }
    
    // Update local state optimistically
    setRegistrations(prev => 
      prev.map(r => r.id === id ? { ...r, registration_status: 'cancelled' as const } : r)
    );
  };

  useEffect(() => {
    if (eventId) {
      fetchRegistrations(eventId);
    } else {
      setRegistrations([]);
      setLoading(false);
      setError(null);
    }
  }, [eventId, fetchRegistrations]);

  return {
    registrations,
    loading,
    error,
    fetchRegistrations: eventId ? () => fetchRegistrations(eventId) : () => {},
    createRegistration,
    updateRegistration,
    cancelRegistration,
  };
}

// Hook for user's event registrations
export function useUserEventRegistrations(userId: string | null) {
  const [registrations, setRegistrations] = useState<EventRegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRegistrations = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await eventService.getUserRegistrations(id);
    
    if (fetchError) {
      setError('Failed to load your registrations');
      console.error('Error fetching user registrations:', fetchError);
    } else {
      setRegistrations(data || []);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserRegistrations(userId);
    } else {
      setRegistrations([]);
      setLoading(false);
      setError(null);
    }
  }, [userId, fetchUserRegistrations]);

  return {
    registrations,
    loading,
    error,
    refetch: userId ? () => fetchUserRegistrations(userId) : () => {},
  };
}

// Hook for event statistics
export function useEventStats() {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    upcoming: number;
    totalRegistrations: number;
    capacity: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: statsError } = await eventService.getEventStats();
      
      if (statsError) {
        setError('Failed to load statistics');
        console.error('Error fetching event stats:', statsError);
      } else {
        setStats(data);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
  };
}