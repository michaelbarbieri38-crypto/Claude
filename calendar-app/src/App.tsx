import { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, addWeeks } from 'date-fns';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import EventModal from './components/EventModal';
import FilePreviewModal from './components/FilePreviewModal';
import AssignAttachmentModal from './components/AssignAttachmentModal';
import QuickAddOverlay from './components/QuickAddOverlay';
import { useCalendarData } from './hooks/useCalendarData';
import type { Attachment, CalendarEvent, EventOccurrence } from './types';
import {
  expandOccurrencesForEvents,
  getMonthGrid,
  getWeekDays,
  toISODate,
} from './utils/dates';
import { extractFilesFromDataTransfer } from './utils/files';

export type ViewMode = 'month' | 'week' | 'day';

type ModalState =
  | { mode: 'create'; date: string; time: string | null; linkAttachmentIds: string[] }
  | { mode: 'edit'; eventId: string }
  | null;

const UPCOMING_WINDOW_DAYS = 180;
const UPCOMING_LIMIT = 20;

export default function App() {
  const data = useCalendarData();
  const [view, setView] = useState<ViewMode>('month');
  const [anchor, setAnchor] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);
  const [modal, setModal] = useState<ModalState>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [assigningAttachmentId, setAssigningAttachmentId] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);
  const modalOpenRef = useRef(false);
  modalOpenRef.current = modal !== null;

  // --- Window-level drag & drop for "quick add" (drop a file with no target event) ---
  useEffect(() => {
    const hasFiles = (e: DragEvent) =>
      !!e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounter.current++;
      if (!modalOpenRef.current) setIsDraggingFile(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) setIsDraggingFile(false);
    };
    const onDrop = async (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounter.current = 0;
      setIsDraggingFile(false);
      if (modalOpenRef.current) return; // the modal's own dropzone already handled it
      if (!e.dataTransfer) return;
      const files = extractFilesFromDataTransfer(e.dataTransfer);
      if (files.length === 0) return;
      let firstId: string | null = null;
      for (const file of files) {
        const att = await data.addAttachmentFile(file, null);
        if (!firstId) firstId = att.id;
      }
      if (firstId) setAssigningAttachmentId(firstId);
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.addAttachmentFile]);

  // --- Visible date range + expanded occurrences for the current view ---
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (view === 'month') {
      const grid = getMonthGrid(anchor);
      return { rangeStart: toISODate(grid[0]), rangeEnd: toISODate(grid[grid.length - 1]) };
    }
    if (view === 'week') {
      const days = getWeekDays(anchor);
      return { rangeStart: toISODate(days[0]), rangeEnd: toISODate(days[days.length - 1]) };
    }
    const iso = toISODate(anchor);
    return { rangeStart: iso, rangeEnd: iso };
  }, [view, anchor]);

  const occurrences = useMemo(
    () => expandOccurrencesForEvents(data.events, rangeStart, rangeEnd),
    [data.events, rangeStart, rangeEnd]
  );

  const upcomingWithAttachments = useMemo(() => {
    const today = toISODate(new Date());
    const until = toISODate(addDays(new Date(), UPCOMING_WINDOW_DAYS));
    const eventsWithAttachments = data.events.filter((e) => data.attachmentsByEvent.has(e.id));
    const occs = expandOccurrencesForEvents(eventsWithAttachments, today, until);
    const byEvent = new Map<string, EventOccurrence>();
    for (const occ of occs) {
      const existing = byEvent.get(occ.event.id);
      if (!existing || occ.occurrenceDate < existing.occurrenceDate) byEvent.set(occ.event.id, occ);
    }
    return Array.from(byEvent.values())
      .sort((a, b) => (a.occurrenceDate < b.occurrenceDate ? -1 : 1))
      .slice(0, UPCOMING_LIMIT)
      .map((occ) => ({ occ, attachments: data.attachmentsByEvent.get(occ.event.id) ?? [] }));
  }, [data.events, data.attachmentsByEvent]);

  // --- Navigation ---
  const goToday = () => setAnchor(new Date());
  const goPrev = () =>
    setAnchor((d) => (view === 'month' ? addMonths(d, -1) : view === 'week' ? addWeeks(d, -1) : addDays(d, -1)));
  const goNext = () =>
    setAnchor((d) => (view === 'month' ? addMonths(d, 1) : view === 'week' ? addWeeks(d, 1) : addDays(d, 1)));

  // --- Modal open/close ---
  const openCreate = (dateISO: string, time: string | null = null, linkAttachmentIds: string[] = []) =>
    setModal({ mode: 'create', date: dateISO, time, linkAttachmentIds });
  const openEdit = (occ: EventOccurrence) => setModal({ mode: 'edit', eventId: occ.event.id });
  const closeModal = () => setModal(null);

  const modalEvent: CalendarEvent | null =
    modal?.mode === 'edit' ? data.events.find((e) => e.id === modal.eventId) ?? null : null;
  const modalAttachments: Attachment[] =
    modal?.mode === 'edit'
      ? data.attachmentsByEvent.get(modal.eventId) ?? []
      : modal?.mode === 'create'
      ? data.attachments.filter((a) => modal.linkAttachmentIds.includes(a.id))
      : [];

  const handleSaveEvent = async (event: CalendarEvent, newFiles: File[]) => {
    await data.saveEvent(event);
    for (const file of newFiles) {
      await data.addAttachmentFile(file, event.id);
    }
    if (modal?.mode === 'create') {
      for (const attId of modal.linkAttachmentIds) {
        await data.assignAttachmentToEvent(attId, event.id);
      }
    }
    closeModal();
  };

  const handleDeleteEvent = async (id: string) => {
    await data.deleteEvent(id);
    closeModal();
  };

  const assigningAttachment = assigningAttachmentId
    ? data.attachments.find((a) => a.id === assigningAttachmentId) ?? null
    : null;

  const viewProps = {
    anchor,
    occurrences,
    attachmentsByEvent: data.attachmentsByEvent,
    onEventClick: openEdit,
    onAttachmentClick: (a: Attachment) => setPreviewAttachment(a),
  };

  return (
    <div className="app-shell">
      <Header
        anchor={anchor}
        view={view}
        onView={setView}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onNewEvent={() => openCreate(toISODate(anchor))}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <div className="app-body">
        <main className="calendar-main">
          {data.loading ? (
            <div className="loading-state">Loading your calendar…</div>
          ) : view === 'month' ? (
            <MonthView {...viewProps} onDayClick={(iso) => openCreate(iso)} />
          ) : view === 'week' ? (
            <WeekView {...viewProps} onSlotClick={(iso, time) => openCreate(iso, time)} />
          ) : (
            <DayView {...viewProps} onSlotClick={(iso, time) => openCreate(iso, time)} />
          )}
        </main>
        <Sidebar
          open={sidebarOpen}
          upcomingWithAttachments={upcomingWithAttachments}
          unassignedAttachments={data.unassignedAttachments}
          onEventClick={openEdit}
          onAttachmentClick={(a) => setPreviewAttachment(a)}
          onUnassignedClick={(a) => setAssigningAttachmentId(a.id)}
        />
      </div>

      {modal && (
        <EventModal
          initialDate={modal.mode === 'create' ? modal.date : ''}
          initialStartTime={modal.mode === 'create' ? modal.time : undefined}
          event={modalEvent}
          attachments={modalAttachments}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onDeleteAttachment={data.deleteAttachment}
          onPreviewAttachment={(a) => setPreviewAttachment(a)}
          onClose={closeModal}
        />
      )}

      {previewAttachment && (
        <FilePreviewModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
      )}

      {assigningAttachment && (
        <AssignAttachmentModal
          attachment={assigningAttachment}
          events={data.events}
          onCreateEvent={(dateISO) => {
            const id = assigningAttachment.id;
            setAssigningAttachmentId(null);
            openCreate(dateISO, null, [id]);
          }}
          onAssignToEvent={async (eventId) => {
            await data.assignAttachmentToEvent(assigningAttachment.id, eventId);
            setAssigningAttachmentId(null);
          }}
          onDelete={async () => {
            await data.deleteAttachment(assigningAttachment.id);
            setAssigningAttachmentId(null);
          }}
          onClose={() => setAssigningAttachmentId(null)}
        />
      )}

      {isDraggingFile && <QuickAddOverlay />}
    </div>
  );
}
