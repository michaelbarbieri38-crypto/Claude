import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay as isSameDayFns,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { CalendarEvent, EventOccurrence } from '../types';

export const ISO_DATE = 'yyyy-MM-dd';

export function toISODate(d: Date): string {
  return format(d, ISO_DATE);
}

export function fromISODate(s: string): Date {
  return parseISO(s);
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export function getMonthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

export function formatTime(hhmm: string | null): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return format(d, 'h:mm a');
}

export function timeToMinutes(hhmm: string | null): number {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Expand a (possibly recurring) event into concrete occurrence dates that fall
 * within [rangeStart, rangeEnd] (both inclusive, ISO date strings).
 */
export function expandOccurrences(
  event: CalendarEvent,
  rangeStart: string,
  rangeEnd: string
): EventOccurrence[] {
  const results: EventOccurrence[] = [];
  const rec = event.recurrence;
  const eventStart = fromISODate(event.date);
  const rangeStartDate = fromISODate(rangeStart);
  const rangeEndDate = fromISODate(rangeEnd);

  if (!rec || rec.freq === 'none') {
    if (event.date >= rangeStart && event.date <= rangeEnd) {
      results.push({ event, occurrenceDate: event.date });
    }
    return results;
  }

  const interval = Math.max(1, rec.interval || 1);
  const maxOccurrences = rec.count ?? 500; // safety cap
  const hardStop = rec.endDate ? fromISODate(rec.endDate) : addMonths(rangeEndDate, 24);

  let cursor = eventStart;
  let occurrenceIndex = 0;

  // Fast-forward cursor close to rangeStart to avoid iterating from the dawn of time
  // for old daily/weekly events. Monthly is left to iterate naturally (counts stay small).
  if (cursor < rangeStartDate) {
    if (rec.freq === 'daily') {
      const diffDays = Math.floor((rangeStartDate.getTime() - cursor.getTime()) / 86400000);
      const steps = Math.floor(diffDays / interval);
      if (steps > 0) {
        cursor = addDays(cursor, steps * interval);
        occurrenceIndex += steps;
      }
    } else if (rec.freq === 'weekly') {
      const diffDays = Math.floor((rangeStartDate.getTime() - cursor.getTime()) / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const steps = Math.floor(diffWeeks / interval);
      if (steps > 0) {
        cursor = addWeeks(cursor, steps * interval);
        occurrenceIndex += steps;
      }
    }
  }

  let guard = 0;
  while (cursor <= rangeEndDate && cursor <= hardStop && guard < 3000) {
    guard++;
    if (rec.count != null && occurrenceIndex >= maxOccurrences) break;

    if (cursor >= rangeStartDate && cursor >= eventStart) {
      results.push({ event, occurrenceDate: toISODate(cursor) });
    }

    occurrenceIndex++;
    if (rec.count != null && occurrenceIndex >= maxOccurrences) break;

    if (rec.freq === 'daily') cursor = addDays(cursor, interval);
    else if (rec.freq === 'weekly') cursor = addWeeks(cursor, interval);
    else if (rec.freq === 'monthly') cursor = addMonths(cursor, interval);
    else break;
  }

  return results;
}

export function expandOccurrencesForEvents(
  events: CalendarEvent[],
  rangeStart: string,
  rangeEnd: string
): EventOccurrence[] {
  const all: EventOccurrence[] = [];
  for (const ev of events) {
    all.push(...expandOccurrences(ev, rangeStart, rangeEnd));
  }
  all.sort((a, b) => {
    if (a.occurrenceDate !== b.occurrenceDate) return a.occurrenceDate < b.occurrenceDate ? -1 : 1;
    if (a.event.allDay !== b.event.allDay) return a.event.allDay ? -1 : 1;
    return timeToMinutes(a.event.startTime) - timeToMinutes(b.event.startTime);
  });
  return all;
}

export { isSameDayFns };
