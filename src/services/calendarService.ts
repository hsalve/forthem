import { db } from '../lib/supabase';
import { CalendarEvent, EventCategory } from '../lib/database.types';

export type CalendarEventInput = {
  family_id: string;
  child_id?: string | null;
  created_by: string;
  title: string;
  category: EventCategory;
  event_date: string;
  event_time?: string | null;
  notes?: string | null;
};

export type CalendarEventUpdate = {
  title: string;
  category: EventCategory;
  event_time?: string | null;
  notes?: string | null;
};

export async function getCalendarEventsForMonth(familyId: string, year: number, month: number): Promise<CalendarEvent[]> {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;

  const { data, error } = await db.calendarEvents()
    .select('*')
    .eq('family_id', familyId)
    .gte('event_date', start)
    .lte('event_date', end)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  const { data, error } = await db.calendarEvents()
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCalendarEvent(eventId: string, input: CalendarEventUpdate): Promise<CalendarEvent> {
  const { data, error } = await db.calendarEvents()
    .update(input)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const { error } = await db.calendarEvents()
    .delete()
    .eq('id', eventId);

  if (error) throw error;
}
