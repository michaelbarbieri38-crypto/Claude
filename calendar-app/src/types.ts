export type RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  freq: RecurrenceFreq;
  interval: number; // every N days/weeks/months
  endDate: string | null; // ISO yyyy-MM-dd, inclusive, or null = forever
  count: number | null; // alternative to endDate: number of occurrences
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO yyyy-MM-dd — first occurrence date
  allDay: boolean;
  startTime: string | null; // "HH:mm" (24h), null if allDay
  endTime: string | null; // "HH:mm" (24h), null if allDay
  location: string;
  notes: string;
  color: string; // hex color
  recurrence: Recurrence;
  createdAt: number;
  updatedAt: number;
}

export interface Attachment {
  id: string;
  eventId: string | null; // null = unassigned (quick-add, not yet linked to an event)
  fileName: string;
  fileType: string; // mime type
  size: number;
  blob: Blob;
  createdAt: number;
}

// An expanded occurrence of a (possibly recurring) event, used for rendering.
export interface EventOccurrence {
  event: CalendarEvent;
  occurrenceDate: string; // ISO yyyy-MM-dd for this specific occurrence
}

export const EVENT_COLORS: { name: string; value: string }[] = [
  { name: 'Blue', value: '#1a73e8' },
  { name: 'Green', value: '#0f9d58' },
  { name: 'Red', value: '#d93025' },
  { name: 'Orange', value: '#f4511e' },
  { name: 'Yellow', value: '#f9ab00' },
  { name: 'Purple', value: '#8430ce' },
  { name: 'Teal', value: '#009688' },
  { name: 'Pink', value: '#e67c73' },
  { name: 'Gray', value: '#5f6368' },
];

export const DEFAULT_RECURRENCE: Recurrence = {
  freq: 'none',
  interval: 1,
  endDate: null,
  count: null,
};
