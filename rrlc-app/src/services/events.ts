import { supabase } from '@/lib/supabaseClient';
import { Event, EventRegistration, CreateEventData, UpdateEventData, CreateEventRegistrationData, UpdateEventRegistrationData, EventWithRegistrations, EventRegistrationWithDetails } from '@/types/database';

// Get all events (admin view)
export async function getAllEvents(): Promise<{ data: Event[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get active events (public view)
export async function getActiveEvents(): Promise<{ data: Event[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching active events:', error);
      return { data: [], error: null };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching active events:', error);
    return { data: [], error: null };
  }
}

// Get single event by ID
export async function getEventById(id: string): Promise<{ data: Event | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get event with registrations
export async function getEventWithRegistrations(id: string): Promise<{ data: EventWithRegistrations | null; error: string | null }> {
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError) return { data: null, error: eventError.message };

    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('event_id', id);

    if (regError) return { data: null, error: regError.message };

    return { 
      data: { 
        ...event, 
        registrations: registrations || [] 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching event with registrations:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Create new event
export async function createEvent(eventData: CreateEventData): Promise<{ data: Event | null; error: string | null }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_by: user.id
      }])
      .select()
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Update existing event
export async function updateEvent(eventData: UpdateEventData): Promise<{ data: Event | null; error: string | null }> {
  try {
    const { id, ...updateData } = eventData;
    
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error updating event:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Soft delete event (set status to cancelled)
export async function deleteEvent(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', id);

    return { success: !error, error: error?.message || null };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Search events
export async function searchEvents(query: string): Promise<{ data: Event[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .eq('status', 'active')
      .order('event_date', { ascending: true });

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error searching events:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// EVENT REGISTRATION FUNCTIONS

// Get all registrations for an event
export async function getEventRegistrations(eventId: string): Promise<{ data: EventRegistrationWithDetails[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(*),
        user:profiles(*)
      `)
      .eq('event_id', eventId)
      .order('registration_date', { ascending: false });

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get user's registrations
export async function getUserRegistrations(userId: string): Promise<{ data: EventRegistrationWithDetails[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(*),
        user:profiles(*)
      `)
      .eq('user_id', userId)
      .order('registration_date', { ascending: false });

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Create event registration
export async function createEventRegistration(registrationData: CreateEventRegistrationData): Promise<{ data: EventRegistration | null; error: string | null }> {
  try {
    // Check if user is already registered
    const { data: existing, error: checkError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', registrationData.event_id)
      .eq('user_id', registrationData.user_id)
      .single();

    if (existing) {
      return { data: null, error: 'User is already registered for this event' };
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([registrationData])
      .select()
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error creating event registration:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Update event registration
export async function updateEventRegistration(registrationData: UpdateEventRegistrationData): Promise<{ data: EventRegistration | null; error: string | null }> {
  try {
    const { id, ...updateData } = registrationData;
    
    const { data, error } = await supabase
      .from('event_registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error: error?.message || null };
  } catch (error) {
    console.error('Error updating event registration:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Cancel event registration
export async function cancelEventRegistration(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({ registration_status: 'cancelled' })
      .eq('id', id);

    return { success: !error, error: error?.message || null };
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    return { success: false, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}

// Get event statistics
export async function getEventStats(): Promise<{ 
  data: {
    total: number;
    active: number;
    upcoming: number;
    totalRegistrations: number;
    capacity: number;
  } | null; 
  error: string | null 
}> {
  try {
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('status, capacity, current_registrations, event_date');

    if (eventsError) return { data: null, error: eventsError.message };

    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('registration_status')
      .eq('registration_status', 'registered');

    if (regError) return { data: null, error: regError.message };

    const today = new Date().toISOString().split('T')[0];
    const stats = {
      total: events.length,
      active: events.filter(e => e.status === 'active').length,
      upcoming: events.filter(e => e.status === 'active' && e.event_date >= today).length,
      totalRegistrations: registrations.length,
      capacity: events.reduce((sum, e) => sum + (e.capacity || 0), 0)
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return { data: null, error: typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error' };
  }
}