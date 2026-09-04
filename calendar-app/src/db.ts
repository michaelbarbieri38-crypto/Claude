import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Attachment, CalendarEvent } from './types';

interface CalendarDB extends DBSchema {
  events: {
    key: string;
    value: CalendarEvent;
    indexes: { 'by-date': string };
  };
  attachments: {
    key: string;
    value: Attachment;
    indexes: { 'by-event': string };
  };
}

const DB_NAME = 'personal-calendar-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CalendarDB>> | null = null;

function getDB(): Promise<IDBPDatabase<CalendarDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CalendarDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('attachments')) {
          const store = db.createObjectStore('attachments', { keyPath: 'id' });
          // eventId can be null for unassigned; IDB indexes skip null keys automatically,
          // which is fine since we query unassigned attachments with getAll() + filter.
          store.createIndex('by-event', 'eventId');
        }
      },
    });
  }
  return dbPromise;
}

export function newId(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const EventsRepo = {
  async getAll(): Promise<CalendarEvent[]> {
    const db = await getDB();
    return db.getAll('events');
  },
  async get(id: string): Promise<CalendarEvent | undefined> {
    const db = await getDB();
    return db.get('events', id);
  },
  async put(event: CalendarEvent): Promise<void> {
    const db = await getDB();
    await db.put('events', event);
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['events', 'attachments'], 'readwrite');
    await tx.objectStore('events').delete(id);
    const attStore = tx.objectStore('attachments');
    const idx = attStore.index('by-event');
    let cursor = await idx.openCursor(IDBKeyRange.only(id));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },
};

export const AttachmentsRepo = {
  async getAll(): Promise<Attachment[]> {
    const db = await getDB();
    return db.getAll('attachments');
  },
  async get(id: string): Promise<Attachment | undefined> {
    const db = await getDB();
    return db.get('attachments', id);
  },
  async getForEvent(eventId: string): Promise<Attachment[]> {
    const db = await getDB();
    return db.getAllFromIndex('attachments', 'by-event', eventId);
  },
  async getUnassigned(): Promise<Attachment[]> {
    const all = await this.getAll();
    return all.filter((a) => a.eventId === null);
  },
  async put(attachment: Attachment): Promise<void> {
    const db = await getDB();
    await db.put('attachments', attachment);
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('attachments', id);
  },
  async assignToEvent(id: string, eventId: string): Promise<void> {
    const db = await getDB();
    const att = await db.get('attachments', id);
    if (!att) return;
    att.eventId = eventId;
    await db.put('attachments', att);
  },
};
