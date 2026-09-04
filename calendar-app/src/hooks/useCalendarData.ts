import { useCallback, useEffect, useMemo, useState } from 'react';
import { AttachmentsRepo, EventsRepo, newId } from '../db';
import type { Attachment, CalendarEvent } from '../types';

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [ev, att] = await Promise.all([EventsRepo.getAll(), AttachmentsRepo.getAll()]);
    setEvents(ev);
    setAttachments(att);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const attachmentsByEvent = useMemo(() => {
    const map = new Map<string, Attachment[]>();
    for (const a of attachments) {
      if (!a.eventId) continue;
      const list = map.get(a.eventId) ?? [];
      list.push(a);
      map.set(a.eventId, list);
    }
    return map;
  }, [attachments]);

  const unassignedAttachments = useMemo(
    () => attachments.filter((a) => a.eventId === null).sort((a, b) => b.createdAt - a.createdAt),
    [attachments]
  );

  const saveEvent = useCallback(
    async (event: CalendarEvent) => {
      await EventsRepo.put(event);
      await refresh();
    },
    [refresh]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      await EventsRepo.delete(id);
      await refresh();
    },
    [refresh]
  );

  const addAttachmentFile = useCallback(
    async (file: File, eventId: string | null): Promise<Attachment> => {
      const attachment: Attachment = {
        id: newId(),
        eventId,
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        blob: file,
        createdAt: Date.now(),
      };
      await AttachmentsRepo.put(attachment);
      await refresh();
      return attachment;
    },
    [refresh]
  );

  const deleteAttachment = useCallback(
    async (id: string) => {
      await AttachmentsRepo.delete(id);
      await refresh();
    },
    [refresh]
  );

  const assignAttachmentToEvent = useCallback(
    async (id: string, eventId: string) => {
      await AttachmentsRepo.assignToEvent(id, eventId);
      await refresh();
    },
    [refresh]
  );

  return {
    events,
    attachments,
    attachmentsByEvent,
    unassignedAttachments,
    loading,
    refresh,
    saveEvent,
    deleteEvent,
    addAttachmentFile,
    deleteAttachment,
    assignAttachmentToEvent,
  };
}

export type CalendarDataApi = ReturnType<typeof useCalendarData>;
